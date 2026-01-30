import random
import string
import os
import boto3
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
        
        # Return True if the ID doesn't exist (is available)
        return 'Item' not in response
        
    except ClientError:
        # If there's an error accessing the database, assume ID is not valid
        return False
    except Exception:
        # For any other error, assume ID is not valid
        return False