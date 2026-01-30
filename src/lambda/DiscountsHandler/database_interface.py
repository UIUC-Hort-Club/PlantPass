import boto3
import logging
import os
from botocore.exceptions import ClientError
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('DISCOUNTS_TABLE', 'discounts')
table = dynamodb.Table(table_name)

def get_all_discounts():
    """Return a list of all discounts."""
    try:
        response = table.scan()
        discounts = response.get('Items', [])
        
        # Convert Decimal to float for JSON serialization
        for discount in discounts:
            if 'percent_off' in discount:
                discount['percent_off'] = float(discount['percent_off'])
        
        logger.info(f"Retrieved {len(discounts)} discounts from database")
        return discounts
    except ClientError as e:
        logger.error(f"Error retrieving discounts: {e}")
        raise Exception(f"Failed to retrieve discounts: {e}")

def create_discount(discount_data):
    """
    Create a new discount.
    discount_data must include at least:
    - name: str
    - percent_off: float
    """
    try:
        # Validate required fields
        if 'name' not in discount_data or 'percent_off' not in discount_data:
            raise ValueError("Both 'name' and 'percent_off' are required")
        
        name = discount_data['name']
        percent_off = Decimal(str(discount_data['percent_off']))
        
        # Check if discount already exists
        try:
            existing = table.get_item(Key={'name': name})
            if 'Item' in existing:
                raise ValueError(f"Discount with name '{name}' already exists")
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceNotFoundException':
                raise
        
        # Create the discount
        item = {
            'name': name,
            'percent_off': percent_off
        }
        
        table.put_item(Item=item)
        
        # Return the created discount with float conversion
        item['percent_off'] = float(item['percent_off'])
        logger.info(f"Created discount: {item}")
        return item
        
    except ValueError as e:
        logger.error(f"Validation error creating discount: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error creating discount: {e}")
        raise Exception(f"Failed to create discount: {e}")

def update_discount(name, update_data):
    """Update an existing discount identified by name."""
    try:
        # Check if discount exists
        try:
            existing = table.get_item(Key={'name': name})
            if 'Item' not in existing:
                raise ValueError(f"Discount with name '{name}' not found")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise ValueError(f"Discount with name '{name}' not found")
            raise
        
        # Build update expression
        update_expression = "SET "
        expression_attribute_values = {}
        
        if 'percent_off' in update_data:
            update_expression += "percent_off = :percent_off"
            expression_attribute_values[':percent_off'] = Decimal(str(update_data['percent_off']))
        
        if not expression_attribute_values:
            raise ValueError("No valid fields to update")
        
        # Update the item
        response = table.update_item(
            Key={'name': name},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='ALL_NEW'
        )
        
        updated_item = response['Attributes']
        # Convert Decimal to float for JSON serialization
        if 'percent_off' in updated_item:
            updated_item['percent_off'] = float(updated_item['percent_off'])
        
        logger.info(f"Updated discount: {updated_item}")
        return updated_item
        
    except ValueError as e:
        logger.error(f"Validation error updating discount: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error updating discount: {e}")
        raise Exception(f"Failed to update discount: {e}")

def delete_discount(name):
    """Delete a discount by name."""
    try:
        # Check if discount exists
        try:
            existing = table.get_item(Key={'name': name})
            if 'Item' not in existing:
                raise ValueError(f"Discount with name '{name}' not found")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise ValueError(f"Discount with name '{name}' not found")
            raise
        
        # Delete the item
        table.delete_item(Key={'name': name})
        logger.info(f"Deleted discount: {name}")
        
    except ValueError as e:
        logger.error(f"Validation error deleting discount: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error deleting discount: {e}")
        raise Exception(f"Failed to delete discount: {e}")
