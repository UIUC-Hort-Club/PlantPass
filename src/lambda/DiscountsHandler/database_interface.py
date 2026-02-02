import boto3
import logging
import os
from botocore.exceptions import ClientError
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DISCOUNTS_TABLE', 'discounts')
table = dynamodb.Table(table_name)

def get_all_discounts():
    """Return a list of all discounts ordered by sort_order."""
    try:
        response = table.scan()
        discounts = response.get('Items', [])
        
        logger.info(f"Raw discounts from database: {discounts}")
        
        for discount in discounts:
            # Convert Decimal to appropriate types and handle both old and new schema
            if 'value' in discount and isinstance(discount['value'], Decimal):
                discount['value'] = float(discount['value'])
            
            if 'sort_order' in discount and isinstance(discount['sort_order'], Decimal):
                discount['sort_order'] = int(discount['sort_order'])
        
        discounts.sort(key=lambda x: x.get('sort_order', 0))
        
        logger.info(f"Processed discounts: {discounts}")
        logger.info(f"Retrieved {len(discounts)} discounts from database")
        return discounts
    except ClientError as e:
        logger.error(f"Error retrieving discounts: {e}")
        raise Exception(f"Failed to retrieve discounts: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in get_all_discounts: {e}")
        raise Exception(f"Failed to retrieve discounts: {e}")

def replace_all_discounts(discounts_data):
    """
    Replace all discounts in the database with the provided list.
    This will delete all existing discounts and create new ones.
    
    discounts_data: List of discount dictionaries with keys:
    - name: str
    - type: str ("percent" or "dollar")
    - value: float (for percent: percentage off, for dollar: dollar amount off)
    - sort_order: int
    """
    try:
        existing_discounts = get_all_discounts()
        
        with table.batch_writer() as batch:
            for discount in existing_discounts:
                batch.delete_item(Key={'name': discount['name']})
        
        logger.info(f"Deleted {len(existing_discounts)} existing discounts")
        
        created_count = 0
        with table.batch_writer() as batch:
            for discount_data in discounts_data:
                if 'name' not in discount_data or 'type' not in discount_data:
                    logger.warning(f"Skipping invalid discount data: {discount_data}")
                    continue
                
                if discount_data['type'] not in ['percent', 'dollar']:
                    logger.warning(f"Skipping discount with invalid type: {discount_data}")
                    continue
                
                item = {
                    'name': discount_data['name'],
                    'type': discount_data['type'],
                    'value': Decimal(str(discount_data.get('value', 0))),
                    'sort_order': int(discount_data.get('sort_order', 0))
                }
                
                batch.put_item(Item=item)
                created_count += 1
        
        logger.info(f"Created {created_count} new discounts")
        return {"deleted": len(existing_discounts), "created": created_count}
        
    except ClientError as e:
        logger.error(f"DynamoDB error replacing discounts: {e}")
        raise Exception(f"Failed to replace discounts: {e}")
    except Exception as e:
        logger.error(f"Error replacing discounts: {e}")
        raise Exception(f"Failed to replace discounts: {e}")