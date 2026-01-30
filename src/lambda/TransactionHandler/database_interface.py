import os
import json
import logging
from datetime import datetime, timezone
from decimal import Decimal
import boto3
from botocore.exceptions import ClientError
from utils import generate_random_id, validate_transaction_id

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TRANSACTIONS_TABLE', 'transactions'))

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(v) for v in obj]
    return obj

def create_transaction(transaction):
    """
    Create the transaction in the database

    ----------
    This expects a transaction object with the following structure:
    {
        "timestamp": 0,
        "items": [
        {
            "SKU": "SKU123",
            "item": "Plant A",
            "quantity": 2,
            "price_ea": 10.00
        }],
        "discounts": [
        {
            "name": "discount name",
            "type": "percent" | "dollar",
            "percent_off": 0,
            "value_off": 0.0,
            "selected": true
        }],
        "voucher": 10     // This is the dollar amount of the voucher, not a percentage
    }

    ----------
    Returns the full transaction data from the backend, which includes discounts applied, etc.
    """
    try:
        # Initialize blank transaction object and populate with expected fields
        transaction_created = {}

        # Init payment info - will be updated after payment processing
        transaction_created["payment"] = {
            "method": "",
            "paid": False
        }

        # Copy over timestamp and items from input transaction
        transaction_created["timestamp"] = transaction.get("timestamp", int(datetime.now(timezone.utc).timestamp()))

        # Generate a unique purchase ID using capital letters (in the form ___-___. For example, ABC-DEF)
        while True:
            purchase_id = generate_random_id()
            if validate_transaction_id(purchase_id):
                break
        transaction_created["purchase_id"] = purchase_id

        # Add items to the transaction
        transaction_created["items"] = transaction.get("items", [])

        # Compute subtotal first (needed for discount calculations)
        subtotal = sum(item["quantity"] * item["price_ea"] for item in transaction_created["items"])

        # Add discounts
        # Note: We pull these from the discounts endpoint and store them with this record in the off chance
        # that the discount details change in the future. This way we can always know exactly what discounts
        # were applied at the time of purchase. This is the same reason the product price is stored with the
        # transaction record instead of being pulled from the product database when needed.
        input_discounts = transaction.get("discounts", [])
        transaction_created["discounts"] = []
        
        # Process each discount and calculate amount_off
        for discount in input_discounts:
            discount_type = discount.get("type")
            selected = discount.get("selected", False)
            
            discount_record = {
                "name": discount.get("name"),
                "type": discount_type,
                "percent_off": discount.get("percent_off", 0),
                "value_off": discount.get("value_off", 0.0)
            }
            
            # Calculate amount_off based on discount type and selection
            if selected:
                if discount_type == "dollar":
                    discount_record["amount_off"] = discount.get("value_off", 0)
                else:  # percent
                    discount_record["amount_off"] = (subtotal * discount.get("percent_off", 0)) / 100
            else:
                discount_record["amount_off"] = 0
            
            transaction_created["discounts"].append(discount_record)

        # Add club voucher amount
        transaction_created["club_voucher"] = transaction.get("voucher", 0)

        # Compute receipt (subtotal, discount, total)
        total_discount = sum(discount.get("amount_off", 0) for discount in transaction_created["discounts"]) + transaction_created["club_voucher"]
        total = max(subtotal - total_discount, 0)  # Total should not be negative
        transaction_created["receipt"] = {
            "subtotal": subtotal,
            "discount": total_discount,
            "total": total
        }

        # Convert to DynamoDB format (handle Decimals)
        db_item = json.loads(json.dumps(transaction_created), parse_float=Decimal)
        
        # Save to database
        table.put_item(Item=db_item)
        logger.info(f"Transaction created successfully: {purchase_id}")
        
        return transaction_created

    except ClientError as e:
        logger.error(f"DynamoDB error creating transaction: {e}")
        raise Exception(f"Failed to create transaction: {e}")
    except Exception as e:
        logger.error(f"Error creating transaction: {e}")
        raise

def read_transaction(transaction_id):
    """
    Retrieve a transaction by its ID.
    """
    try:
        response = table.get_item(Key={'purchase_id': transaction_id})
        
        if 'Item' not in response:
            logger.warning(f"Transaction not found: {transaction_id}")
            return None
            
        # Convert Decimal objects to float for JSON serialization
        transaction = decimal_to_float(response['Item'])
        logger.info(f"Transaction retrieved successfully: {transaction_id}")
        return transaction
        
    except ClientError as e:
        logger.error(f"DynamoDB error reading transaction {transaction_id}: {e}")
        raise Exception(f"Failed to read transaction: {e}")
    except Exception as e:
        logger.error(f"Error reading transaction {transaction_id}: {e}")
        raise

def update_transaction(transaction_id, updated_transaction):
    """
    Update an existing transaction with new data.
    The use case here is that after order lookup, the customer
    may choose to update the order or it was found that the
    order details were incorrect and need to be updated. In
    this case, we want to update the existing record in the
    database with the new transaction data.
    """
    try:
        # First, get the existing transaction
        existing = read_transaction(transaction_id)
        if not existing:
            raise Exception(f"Transaction {transaction_id} not found")
        
        # Update fields that are provided
        if "items" in updated_transaction:
            existing["items"] = updated_transaction["items"]
            
        if "discounts" in updated_transaction:
            existing["discounts"] = updated_transaction["discounts"]
            
        if "voucher" in updated_transaction:
            existing["club_voucher"] = updated_transaction["voucher"]
            
        if "payment" in updated_transaction:
            existing["payment"].update(updated_transaction["payment"])
        
        # Recalculate receipt if items or discounts changed
        if "items" in updated_transaction or "discounts" in updated_transaction or "voucher" in updated_transaction:
            subtotal = sum(item["quantity"] * item["price_ea"] for item in existing["items"])
            total_discount = sum(discount.get("amount_off", 0) for discount in existing["discounts"]) + existing.get("club_voucher", 0)
            total = max(subtotal - total_discount, 0)
            
            existing["receipt"] = {
                "subtotal": subtotal,
                "discount": total_discount,
                "total": total
            }
        
        # Convert to DynamoDB format
        db_item = json.loads(json.dumps(existing), parse_float=Decimal)
        
        # Update in database
        table.put_item(Item=db_item)
        logger.info(f"Transaction updated successfully: {transaction_id}")
        
        return existing
        
    except ClientError as e:
        logger.error(f"DynamoDB error updating transaction {transaction_id}: {e}")
        raise Exception(f"Failed to update transaction: {e}")
    except Exception as e:
        logger.error(f"Error updating transaction {transaction_id}: {e}")
        raise

def delete_transaction(transaction_id):
    """
    Delete a transaction by its ID.
    """
    try:
        table.delete_item(Key={'purchase_id': transaction_id})
        logger.info(f"Transaction deleted successfully: {transaction_id}")
        
    except ClientError as e:
        logger.error(f"DynamoDB error deleting transaction {transaction_id}: {e}")
        raise Exception(f"Failed to delete transaction: {e}")
    except Exception as e:
        logger.error(f"Error deleting transaction {transaction_id}: {e}")
        raise

def compute_sales_analytics():
    """
    Compute sales analytics such as total sales, average order value, etc.
    
    Returns analytics grouped into 30-minute time blocks aligned to clock boundaries.
    """
    try:
        # Scan all transactions
        response = table.scan()
        transactions = response['Items']
        
        # Continue scanning if there are more items
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            transactions.extend(response['Items'])
        
        if not transactions:
            return {
                "total_sales": 0.0,
                "total_orders": 0,
                "total_units_sold": 0,
                "average_items_per_order": 0.0,
                "average_order_value": 0.0,
                "sales_over_time": {},
                "transactions": []
            }
        
        # Convert Decimal objects
        transactions = decimal_to_float(transactions)
        
        # Calculate basic metrics
        total_sales = 0.0
        total_orders = len(transactions)
        total_units_sold = 0
        sales_by_time_bucket = {}
        transaction_summaries = []
        
        for transaction in transactions:
            receipt = transaction.get("receipt", {})
            total = receipt.get("total", 0)
            total_sales += total
            
            # Count total units sold
            items = transaction.get("items", [])
            transaction_units = sum(item.get("quantity", 0) for item in items)
            total_units_sold += transaction_units
            
            # Create transaction summary
            transaction_summaries.append({
                "purchase_id": transaction.get("purchase_id"),
                "timestamp": transaction.get("timestamp"),
                "total_quantity": transaction_units,
                "grand_total": total
            })
            
            # Group by 30-minute time buckets
            timestamp = transaction.get("timestamp", 0)
            if timestamp:
                dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                # Align to 30-minute boundaries
                minute = 0 if dt.minute < 30 else 30
                bucket_time = dt.replace(minute=minute, second=0, microsecond=0)
                bucket_key = bucket_time.strftime("%m-%d-%Y %I:%M %p")
                
                if bucket_key not in sales_by_time_bucket:
                    sales_by_time_bucket[bucket_key] = 0.0
                sales_by_time_bucket[bucket_key] += total
        
        # Calculate averages
        average_items_per_order = total_units_sold / total_orders if total_orders > 0 else 0.0
        average_order_value = total_sales / total_orders if total_orders > 0 else 0.0
        
        # Fill in empty time buckets if needed
        if transactions:
            timestamps = [t.get("timestamp", 0) for t in transactions if t.get("timestamp")]
            if timestamps:
                min_time = min(timestamps)
                max_time = max(timestamps)
                
                current_time = datetime.fromtimestamp(min_time, tz=timezone.utc)
                end_time = datetime.fromtimestamp(max_time, tz=timezone.utc)
                
                while current_time <= end_time:
                    minute = 0 if current_time.minute < 30 else 30
                    bucket_time = current_time.replace(minute=minute, second=0, microsecond=0)
                    bucket_key = bucket_time.strftime("%m-%d-%Y %I:%M %p")
                    
                    if bucket_key not in sales_by_time_bucket:
                        sales_by_time_bucket[bucket_key] = 0.0
                    
                    current_time += datetime.timedelta(minutes=30)
        
        analytics = {
            "total_sales": round(total_sales, 2),
            "total_orders": total_orders,
            "total_units_sold": total_units_sold,
            "average_items_per_order": round(average_items_per_order, 2),
            "average_order_value": round(average_order_value, 2),
            "sales_over_time": sales_by_time_bucket,
            "transactions": transaction_summaries
        }
        
        logger.info(f"Analytics computed for {total_orders} transactions")
        return analytics
        
    except ClientError as e:
        logger.error(f"DynamoDB error computing analytics: {e}")
        raise Exception(f"Failed to compute analytics: {e}")
    except Exception as e:
        logger.error(f"Error computing analytics: {e}")
        raise

def export_transaction_data():
    """
    Export all transaction data in a format suitable for export (e.g., CSV, JSON).
    Note: For MVP, returning JSON data directly. For production, consider S3 + presigned URLs.
    """
    try:
        # Scan all transactions
        response = table.scan()
        transactions = response['Items']
        
        # Continue scanning if there are more items
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            transactions.extend(response['Items'])
        
        # Convert Decimal objects
        transactions = decimal_to_float(transactions)
        
        logger.info(f"Exported {len(transactions)} transactions")
        return transactions
        
    except ClientError as e:
        logger.error(f"DynamoDB error exporting data: {e}")
        raise Exception(f"Failed to export data: {e}")
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        raise