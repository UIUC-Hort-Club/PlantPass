import random
import string
import os
import boto3
from decimal import Decimal
from botocore.exceptions import ClientError

def generate_random_id():
    """Generates a random 3 letter - 3 letter id like AAA-AAA"""
    letters = string.ascii_uppercase
    first_part = ''.join(random.choices(letters, k=3))
    second_part = ''.join(random.choices(letters, k=3))
    return f"{first_part}-{second_part}"

def validate_transaction_id(transaction_id):
    """Validates that the transaction ID does not exist in the database"""
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table(os.environ.get('TRANSACTIONS_TABLE', 'transactions'))
        
        response = table.get_item(Key={'purchase_id': transaction_id})
        
        return 'Item' not in response
        
    except ClientError:
        return False
    except Exception:
        return False

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(v) for v in obj]
    return obj