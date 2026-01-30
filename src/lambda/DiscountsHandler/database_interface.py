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
    """Return a list of all discounts ordered by sort_order."""
    try:
        response = table.scan()
        discounts = response.get('Items', [])
        
        # Convert all Decimal objects to appropriate types for JSON serialization
        for discount in discounts:
            # Convert percent_off from Decimal to float
            if 'percent_off' in discount and isinstance(discount['percent_off'], Decimal):
                discount['percent_off'] = float(discount['percent_off'])
            
            # Convert value_off from Decimal to float
            if 'value_off' in discount and isinstance(discount['value_off'], Decimal):
                discount['value_off'] = float(discount['value_off'])
            
            # Convert sort_order from Decimal to int
            if 'sort_order' in discount and isinstance(discount['sort_order'], Decimal):
                discount['sort_order'] = int(discount['sort_order'])
        
        # Sort by sort_order
        discounts.sort(key=lambda x: x.get('sort_order', 0))
        
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
    - percent_off: float (optional, for percent discounts)
    - value_off: float (optional, for dollar discounts)
    - type: str ("percent" or "dollar")
    - sort_order: int (optional - if not provided, will be set to next available)
    """
    try:
        # Validate required fields
        if 'name' not in discount_data or 'type' not in discount_data:
            raise ValueError("Both 'name' and 'type' are required")
        
        name = discount_data['name']
        discount_type = discount_data['type']
        
        # Validate discount type
        if discount_type not in ['percent', 'dollar']:
            raise ValueError("Type must be 'percent' or 'dollar'")
        
        # Validate that appropriate value is provided
        if discount_type == 'percent':
            if 'percent_off' not in discount_data:
                raise ValueError("percent_off is required for percent discounts")
            percent_off = Decimal(str(discount_data['percent_off']))
            value_off = Decimal('0')
        else:  # dollar
            if 'value_off' not in discount_data:
                raise ValueError("value_off is required for dollar discounts")
            value_off = Decimal(str(discount_data['value_off']))
            percent_off = Decimal('0')
        
        # Set sort order
        if 'sort_order' in discount_data:
            sort_order = int(discount_data['sort_order'])
        else:
            # Get the highest sort_order and add 1
            try:
                response = table.scan(
                    ProjectionExpression='sort_order'
                )
                existing_orders = [item.get('sort_order', 0) for item in response.get('Items', [])]
                sort_order = max(existing_orders, default=0) + 1
            except ClientError:
                sort_order = 1
        
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
            'type': discount_type,
            'percent_off': percent_off,
            'value_off': value_off,
            'sort_order': sort_order
        }
        
        table.put_item(Item=item)
        
        # Return the created discount with proper type conversion
        item['percent_off'] = float(item['percent_off'])
        item['value_off'] = float(item['value_off'])
        item['sort_order'] = int(item['sort_order'])
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
            if expression_attribute_values:
                update_expression += ", "
            update_expression += "percent_off = :percent_off"
            expression_attribute_values[':percent_off'] = Decimal(str(update_data['percent_off']))
        
        if 'value_off' in update_data:
            if expression_attribute_values:
                update_expression += ", "
            update_expression += "value_off = :value_off"
            expression_attribute_values[':value_off'] = Decimal(str(update_data['value_off']))
        
        if 'type' in update_data:
            if expression_attribute_values:
                update_expression += ", "
            update_expression += "#discount_type = :discount_type"
            expression_attribute_values[':discount_type'] = update_data['type']
            # Add expression attribute name for reserved word 'type'
            expression_attribute_names = {'#discount_type': 'type'}
        
        if 'sort_order' in update_data:
            if expression_attribute_values:
                update_expression += ", "
            update_expression += "sort_order = :sort_order"
            expression_attribute_values[':sort_order'] = int(update_data['sort_order'])
        
        if not expression_attribute_values:
            raise ValueError("No valid fields to update")
        
        # Update the item
        update_params = {
            'Key': {'name': name},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_attribute_values,
            'ReturnValues': 'ALL_NEW'
        }
        
        # Add expression attribute names if needed (for reserved words like 'type')
        if 'type' in update_data:
            update_params['ExpressionAttributeNames'] = {'#discount_type': 'type'}
        
        response = table.update_item(**update_params)
        
        updated_item = response['Attributes']
        # Convert Decimal objects to appropriate types for JSON serialization
        if 'percent_off' in updated_item and isinstance(updated_item['percent_off'], Decimal):
            updated_item['percent_off'] = float(updated_item['percent_off'])
        if 'value_off' in updated_item and isinstance(updated_item['value_off'], Decimal):
            updated_item['value_off'] = float(updated_item['value_off'])
        if 'sort_order' in updated_item and isinstance(updated_item['sort_order'], Decimal):
            updated_item['sort_order'] = int(updated_item['sort_order'])
        
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
