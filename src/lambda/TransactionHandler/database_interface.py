import os
import json
import logging
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
        
        # Create Transaction object from JSON input
        transaction = Transaction.from_json(transaction_data)
        
        # Convert to database format and save
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
        
        # Get existing transaction
        existing_data = read_transaction(transaction_id)
        if not existing_data:
            raise Exception(f"Transaction {transaction_id} not found")
        
        # Create Transaction object from existing data
        transaction = Transaction.from_db_record(existing_data)
        
        # Apply updates
        if "items" in updated_data:
            transaction.update_items(updated_data["items"])
            
        if "discounts" in updated_data:
            transaction.update_discounts(updated_data["discounts"])
            
        if "voucher" in updated_data:
            transaction.update_voucher(updated_data["voucher"])
            
        if "payment" in updated_data:
            transaction.update_payment(updated_data["payment"])
        
        # Save updated transaction
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

def get_recent_unpaid_transactions(limit=5):
    """
    Retrieve recent unpaid transactions.
    
    Args:
        limit (int): Maximum number of transactions to return
        
    Returns:
        list: List of unpaid transactions sorted by timestamp (newest first)
    """
    try:
        response = table.scan()
        transactions = response['Items']
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            transactions.extend(response['Items'])
        
        # Filter unpaid transactions
        unpaid_transactions = [
            t for t in transactions 
            if not t.get('payment', {}).get('paid', False)
        ]
        
        # Sort by timestamp (newest first)
        unpaid_transactions.sort(
            key=lambda x: x.get('timestamp', 0), 
            reverse=True
        )
        
        # Limit results
        limited_transactions = unpaid_transactions[:limit]
        
        # Convert to float and return
        result = decimal_to_float(limited_transactions)
        logger.info(f"Retrieved {len(result)} recent unpaid transactions")
        return result
        
    except ClientError as e:
        logger.error(f"DynamoDB error getting recent unpaid transactions: {e}")
        raise Exception(f"Failed to get recent unpaid transactions: {e}")
    except Exception as e:
        logger.error(f"Error getting recent unpaid transactions: {e}")
        raise Exception(f"Failed to get recent unpaid transactions: {e}")