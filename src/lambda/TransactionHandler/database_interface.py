import os
import json
import logging
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import boto3
from botocore.exceptions import ClientError
from utils import generate_random_id, validate_transaction_id

logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
            "value": 10.0,  // For percent: 10 = 10% off, for dollar: 10 = $10 off
            "selected": true
        }],
        "voucher": 10     // This is the dollar amount of the voucher, not a percentage
    }

    ----------
    Returns the full transaction data from the backend, which includes discounts applied, etc.
    """
    try:
        transaction_created = {}

        transaction_created["payment"] = {
            "method": "",
            "paid": False
        }

        transaction_created["timestamp"] = transaction.get("timestamp", int(datetime.now(timezone.utc).timestamp()))

        while True:
            purchase_id = generate_random_id()
            if validate_transaction_id(purchase_id):
                break
        transaction_created["purchase_id"] = purchase_id

        transaction_created["items"] = transaction.get("items", [])

        subtotal = sum(item["quantity"] * item["price_ea"] for item in transaction_created["items"])

        # Add discounts
        # Note: We pull these from the discounts endpoint and store them with this record in the off chance
        # that the discount details change in the future. This way we can always know exactly what discounts
        # were applied at the time of purchase. This is the same reason the product price is stored with the
        # transaction record instead of being pulled from the product database when needed.
        input_discounts = transaction.get("discounts", [])
        transaction_created["discounts"] = []
        
        for discount in input_discounts:
            discount_type = discount.get("type")
            selected = discount.get("selected", False)
            
            discount_record = {
                "name": discount.get("name"),
                "type": discount_type,
                "value": discount.get("value", 0)
            }
            
            if selected:
                if discount_type == "dollar":
                    discount_record["amount_off"] = discount.get("value", 0)
                else:
                    discount_record["amount_off"] = (subtotal * discount.get("value", 0)) / 100
            else:
                discount_record["amount_off"] = 0
            
            transaction_created["discounts"].append(discount_record)

        transaction_created["club_voucher"] = transaction.get("voucher", 0)

        total_discount = sum(discount.get("amount_off", 0) for discount in transaction_created["discounts"]) + transaction_created["club_voucher"]
        total = max(subtotal - total_discount, 0)
        transaction_created["receipt"] = {
            "subtotal": subtotal,
            "discount": total_discount,
            "total": total
        }

        db_item = json.loads(json.dumps(transaction_created), parse_float=Decimal)
        
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
    
    @NOTE This function preserves historical pricing and discount rates.
    Only quantities, discount selections, voucher amounts, and payment info can be updated.
    Original prices and discount rates are preserved to maintain transaction integrity.
    """
    try:
        logger.info(f"Starting update for transaction {transaction_id}")
        logger.info(f"Update data received: {json.dumps(updated_transaction, indent=2)}")
        
        existing = read_transaction(transaction_id)
        if not existing:
            raise Exception(f"Transaction {transaction_id} not found")
        
        logger.info(f"Original transaction loaded: {json.dumps(existing, indent=2, default=str)}")
        
        if "items" in updated_transaction:
            logger.info("Processing items update...")
            updated_items = updated_transaction["items"]
            preserved_items = []
            
            for updated_item in updated_items:
                sku = updated_item["SKU"]
                original_item = next((item for item in existing["items"] if item["SKU"] == sku), None)
                
                if original_item:
                    preserved_item = {
                        "SKU": sku,
                        "item": original_item["item"],
                        "quantity": updated_item["quantity"],
                        "price_ea": original_item["price_ea"]
                    }
                    logger.info(f"Preserving item {sku}: quantity {original_item['quantity']} -> {updated_item['quantity']}, price preserved at {original_item['price_ea']}")
                    preserved_items.append(preserved_item)
                else:
                    logger.info(f"Adding new item {sku}: {updated_item}")
                    preserved_items.append(updated_item)
            
            existing["items"] = preserved_items
            logger.info(f"Updated items: {json.dumps(preserved_items, indent=2, default=str)}")
            
        if "discounts" in updated_transaction:
            logger.info("Processing discounts update...")
            updated_discounts = updated_transaction["discounts"]
            preserved_discounts = []
            
            subtotal = sum(item["quantity"] * item["price_ea"] for item in existing["items"])
            logger.info(f"Calculated subtotal for discount calculations: {subtotal}")
            
            for updated_discount in updated_discounts:
                discount_name = updated_discount["name"]
                original_discount = next((d for d in existing["discounts"] if d["name"] == discount_name), None)
                
                logger.info(f"Processing discount '{discount_name}'...")
                
                if original_discount:
                    discount_record = {
                        "name": discount_name,
                        "type": original_discount["type"],
                        "value": original_discount["value"]
                    }
                    
                    selected = updated_discount.get("selected", False)
                    logger.info(f"Discount '{discount_name}': type={original_discount['type']}, value={original_discount['value']}, selected={selected}")
                    
                    if selected:
                        if original_discount["type"] == "dollar":
                            discount_record["amount_off"] = original_discount["value"]
                            logger.info(f"Dollar discount applied: ${original_discount['value']}")
                        else:
                            discount_amount = (subtotal * original_discount["value"]) / 100
                            discount_record["amount_off"] = discount_amount
                            logger.info(f"Percent discount applied: {original_discount['value']}% of ${subtotal} = ${discount_amount}")
                    else:
                        discount_record["amount_off"] = 0
                        logger.info(f"Discount '{discount_name}' not selected, amount_off = 0")
                    
                    preserved_discounts.append(discount_record)
                else:
                    logger.info(f"New discount '{discount_name}' added: {updated_discount}")
                    preserved_discounts.append(updated_discount)
            
            existing["discounts"] = preserved_discounts
            logger.info(f"Updated discounts: {json.dumps(preserved_discounts, indent=2, default=str)}")
            
        if "voucher" in updated_transaction:
            old_voucher = existing.get("club_voucher", 0)
            new_voucher = updated_transaction["voucher"]
            existing["club_voucher"] = new_voucher
            logger.info(f"Voucher updated: ${old_voucher} -> ${new_voucher}")
            
        if "payment" in updated_transaction:
            logger.info(f"Payment info updated: {updated_transaction['payment']}")
            existing["payment"].update(updated_transaction["payment"])
        
        if "items" in updated_transaction or "discounts" in updated_transaction or "voucher" in updated_transaction:
            logger.info("Recalculating receipt totals...")
            
            subtotal = sum(item["quantity"] * item["price_ea"] for item in existing["items"])
            logger.info(f"Final subtotal: ${subtotal}")
            
            discount_amounts = [discount.get("amount_off", 0) for discount in existing["discounts"]]
            total_discount_from_discounts = sum(discount_amounts)
            voucher_amount = existing.get("club_voucher", 0)
            total_discount = total_discount_from_discounts + voucher_amount
            
            logger.info(f"Discount breakdown:")
            for i, discount in enumerate(existing["discounts"]):
                logger.info(f"  - {discount['name']}: ${discount_amounts[i]}")
            logger.info(f"  - Voucher: ${voucher_amount}")
            logger.info(f"Total discount: ${total_discount}")
            
            total = max(subtotal - total_discount, 0)
            logger.info(f"Final total: max(${subtotal} - ${total_discount}, 0) = ${total}")
            
            existing["receipt"] = {
                "subtotal": subtotal,
                "discount": total_discount,
                "total": total
            }
            logger.info(f"Updated receipt: {json.dumps(existing['receipt'], indent=2, default=str)}")
        
        db_item = json.loads(json.dumps(existing), parse_float=Decimal)
        
        table.put_item(Item=db_item)
        logger.info(f"Transaction updated successfully in database: {transaction_id}")
        logger.info(f"Final transaction state: {json.dumps(existing, indent=2, default=str)}")
        
        return existing
        
    except ClientError as e:
        logger.error(f"DynamoDB error updating transaction {transaction_id}: {e}")
        raise Exception(f"Failed to update transaction: {e}")
    except Exception as e:
        logger.error(f"Error updating transaction {transaction_id}: {e}")
        raise Exception(f"Failed to update transaction: {e}")

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
        response = table.scan()
        transactions = response['Items']
        
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
        
        transactions = decimal_to_float(transactions)
        
        total_sales = 0.0
        total_orders = len(transactions)
        total_units_sold = 0
        sales_by_time_bucket = {}
        transaction_summaries = []
        
        for transaction in transactions:
            receipt = transaction.get("receipt", {})
            total = receipt.get("total", 0)
            total_sales += total
            
            items = transaction.get("items", [])
            transaction_units = sum(item.get("quantity", 0) for item in items)
            total_units_sold += transaction_units
            
            transaction_summaries.append({
                "purchase_id": transaction.get("purchase_id"),
                "timestamp": transaction.get("timestamp"),
                "total_quantity": transaction_units,
                "grand_total": total
            })
            
            timestamp = transaction.get("timestamp", 0)
            if timestamp:
                dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                minute = 0 if dt.minute < 30 else 30
                bucket_time = dt.replace(minute=minute, second=0, microsecond=0)
                bucket_key = bucket_time.strftime("%m-%d-%Y %I:%M %p")
                
                if bucket_key not in sales_by_time_bucket:
                    sales_by_time_bucket[bucket_key] = 0.0
                sales_by_time_bucket[bucket_key] += total
        
        average_items_per_order = total_units_sold / total_orders if total_orders > 0 else 0.0
        average_order_value = total_sales / total_orders if total_orders > 0 else 0.0
        
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
                    
                    current_time += timedelta(minutes=30)
        
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
        response = table.scan()
        transactions = response['Items']
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            transactions.extend(response['Items'])
        
        transactions = decimal_to_float(transactions)
        
        logger.info(f"Exported {len(transactions)} transactions")
        return transactions
        
    except ClientError as e:
        logger.error(f"DynamoDB error exporting data: {e}")
        raise Exception(f"Failed to export data: {e}")
    except Exception as e:
        logger.error(f"Error exporting data: {e}")
        raise

def clear_all_transactions():
    """
    Clear all transactions from the database.
    
    Returns the number of transactions that were deleted.
    """
    try:
        response = table.scan()
        transactions = response['Items']
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            transactions.extend(response['Items'])
        
        if not transactions:
            logger.info("No transactions found to clear")
            return 0
        
        with table.batch_writer() as batch:
            for transaction in transactions:
                batch.delete_item(Key={'purchase_id': transaction['purchase_id']})
        
        cleared_count = len(transactions)
        logger.info(f"Successfully cleared {cleared_count} transactions")
        return cleared_count
        
    except ClientError as e:
        logger.error(f"DynamoDB error clearing transactions: {e}")
        raise Exception(f"Failed to clear transactions: {e}")
    except Exception as e:
        logger.error(f"Error clearing transactions: {e}")
        raise