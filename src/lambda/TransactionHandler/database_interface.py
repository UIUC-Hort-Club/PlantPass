import os
import json
import logging
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import boto3
from botocore.exceptions import ClientError
from utils import decimal_to_float
from transaction import Transaction

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ.get('TRANSACTIONS_TABLE', 'transactions'))

def create_transaction(transaction_data):
    """
    Create a transaction in the database.
    
    Args:
        transaction_data (dict): Transaction data from API call
        
    Returns:
        dict: Created transaction data
    """
    try:
        logger.info("Starting transaction creation...")
        
        transaction = Transaction.from_json(transaction_data)
        
        db_item = transaction.to_db_record()
        table.put_item(Item=db_item)
        
        logger.info(f"Transaction created successfully in database: {transaction.purchase_id}")
        return transaction.to_dict()

    except ClientError as e:
        logger.error(f"DynamoDB error creating transaction: {e}", exc_info=True)
        raise Exception(f"Failed to create transaction: {e}")
    except Exception as e:
        logger.error(f"Error creating transaction: {e}", exc_info=True)
        raise Exception(f"Failed to create transaction: {e}")

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
        raise Exception(f"Failed to read transaction: {e}")

def update_transaction(transaction_id, updated_data):
    """
    Update an existing transaction with new data.
    
    Args:
        transaction_id (str): Transaction ID to update
        updated_data (dict): Updated transaction data
        
    Returns:
        dict: Updated transaction data
    """
    try:
        logger.info(f"Starting update for transaction {transaction_id}")
        logger.info(f"Update data received: {json.dumps(updated_data, indent=2)}")
        
        existing_data = read_transaction(transaction_id)
        if not existing_data:
            raise Exception(f"Transaction {transaction_id} not found")
        
        transaction = Transaction.from_db_record(existing_data)
        
        if "items" in updated_data:
            transaction.update_items(updated_data["items"])
            
        if "discounts" in updated_data:
            transaction.update_discounts(updated_data["discounts"])
            
        if "voucher" in updated_data:
            transaction.update_voucher(updated_data["voucher"])
            
        if "payment" in updated_data:
            transaction.update_payment(updated_data["payment"])
        
        db_item = transaction.to_db_record()
        table.put_item(Item=db_item)
        
        logger.info(f"Transaction updated successfully in database: {transaction_id}")
        return transaction.to_dict()
        
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
        raise Exception(f"Failed to delete transaction: {e}")

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
        
        for transaction_data in transactions:
            transaction = Transaction.from_db_record(transaction_data)
            summary = transaction.get_summary()
            
            total_sales += summary["grand_total"]
            total_units_sold += summary["total_quantity"]
            transaction_summaries.append(summary)
            
            timestamp = transaction.timestamp
            if timestamp:
                dt = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                minute = 0 if dt.minute < 30 else 30
                bucket_time = dt.replace(minute=minute, second=0, microsecond=0)
                bucket_key = bucket_time.strftime("%m-%d-%Y %I:%M %p")
                
                if bucket_key not in sales_by_time_bucket:
                    sales_by_time_bucket[bucket_key] = 0.0
                sales_by_time_bucket[bucket_key] += summary["grand_total"]
        
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
        raise Exception(f"Failed to compute analytics: {e}")

def export_transaction_data():
    """
    @TODO: Export all transaction data in a format suitable for export (e.g., CSV, JSON).
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