import boto3
import logging
import os
import re
from botocore.exceptions import ClientError
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('PRODUCTS_TABLE', 'products')
table = dynamodb.Table(table_name)

def generate_sku(item_name):
    """
    Generate SKU from item name.
    --> Might change implementation in the future but this works for now

    Requires O(n) time but speed is not a concern here - updates to this table are not time sensitive

    Takes first two letters and adds a three-digit number.
    If the two letters already exist, increment the number.

    Example: "bean" -> "BE001", "bee balm" -> "BE002"
    """
    # Extract first two letters, convert to uppercase
    prefix = re.sub(r'[^a-zA-Z]', '', item_name)[:2].upper()
    
    if len(prefix) < 2:
        # If less than 2 letters, pad with 'X'
        prefix = (prefix + 'XX')[:2]
    
    # Find existing SKUs with this prefix
    try:
        response = table.scan(
            FilterExpression='begins_with(SKU, :prefix)',
            ExpressionAttributeValues={':prefix': prefix}
        )
        
        existing_skus = [item['SKU'] for item in response.get('Items', [])]
        
        # Extract numbers from existing SKUs
        numbers = []
        for sku in existing_skus:
            if len(sku) == 5 and sku[:2] == prefix:
                try:
                    num = int(sku[2:])
                    numbers.append(num)
                except ValueError:
                    continue
        
        # Find next available number
        next_num = 1
        while next_num in numbers:
            next_num += 1
        
        return f"{prefix}{next_num:03d}"
        
    except ClientError as e:
        logger.error(f"Error generating SKU: {e}")
        # Fallback to 001 if scan fails
        return f"{prefix}001"

def get_all_products():
    """Return a list of all products."""
    try:
        response = table.scan()
        products = response.get('Items', [])
        
        # Convert Decimal to float for JSON serialization
        for product in products:
            if 'price_ea' in product:
                product['price_ea'] = float(product['price_ea'])
        
        logger.info(f"Retrieved {len(products)} products from database")
        return products
    except ClientError as e:
        logger.error(f"Error retrieving products: {e}")
        raise Exception(f"Failed to retrieve products: {e}")

def create_product(product_data):
    """
    Create a new product.
    product_data must include at least:
    - item: str
    - price_ea: float
    SKU will be generated automatically from the item name.
    """
    try:
        # Validate required fields
        if 'item' not in product_data or 'price_ea' not in product_data:
            raise ValueError("Both 'item' and 'price_ea' are required")
        
        item_name = product_data['item']
        price_ea = Decimal(str(product_data['price_ea']))
        
        # Generate SKU
        sku = generate_sku(item_name)
        
        # Check if SKU already exists (should be rare but possible)
        try:
            existing = table.get_item(Key={'SKU': sku})
            if 'Item' in existing:
                # This should be very rare, but if it happens, try a few more times
                for i in range(10):
                    sku = generate_sku(item_name + str(i))
                    existing = table.get_item(Key={'SKU': sku})
                    if 'Item' not in existing:
                        break
                else:
                    raise ValueError(f"Unable to generate unique SKU for item '{item_name}'")
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceNotFoundException':
                raise
        
        # Create the product
        item = {
            'SKU': sku,
            'item': item_name,
            'price_ea': price_ea
        }
        
        table.put_item(Item=item)
        
        # Return the created product with float conversion
        item['price_ea'] = float(item['price_ea'])
        logger.info(f"Created product: {item}")
        return item
        
    except ValueError as e:
        logger.error(f"Validation error creating product: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error creating product: {e}")
        raise Exception(f"Failed to create product: {e}")

def update_product(sku, update_data):
    """Update an existing product identified by SKU."""
    try:
        # Check if product exists
        try:
            existing = table.get_item(Key={'SKU': sku})
            if 'Item' not in existing:
                raise ValueError(f"Product with SKU '{sku}' not found")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise ValueError(f"Product with SKU '{sku}' not found")
            raise
        
        # Build update expression
        update_expression = "SET "
        expression_attribute_values = {}
        update_parts = []
        
        if 'item' in update_data:
            update_parts.append("item = :item")
            expression_attribute_values[':item'] = update_data['item']
        
        if 'price_ea' in update_data:
            update_parts.append("price_ea = :price_ea")
            expression_attribute_values[':price_ea'] = Decimal(str(update_data['price_ea']))
        
        if not update_parts:
            raise ValueError("No valid fields to update")
        
        update_expression += ", ".join(update_parts)
        
        # Update the item
        response = table.update_item(
            Key={'SKU': sku},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='ALL_NEW'
        )
        
        updated_item = response['Attributes']
        # Convert Decimal to float for JSON serialization
        if 'price_ea' in updated_item:
            updated_item['price_ea'] = float(updated_item['price_ea'])
        
        logger.info(f"Updated product: {updated_item}")
        return updated_item
        
    except ValueError as e:
        logger.error(f"Validation error updating product: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error updating product: {e}")
        raise Exception(f"Failed to update product: {e}")

def delete_product(sku):
    """Delete a product by SKU."""
    try:
        # Check if product exists
        try:
            existing = table.get_item(Key={'SKU': sku})
            if 'Item' not in existing:
                raise ValueError(f"Product with SKU '{sku}' not found")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                raise ValueError(f"Product with SKU '{sku}' not found")
            raise
        
        # Delete the item
        table.delete_item(Key={'SKU': sku})
        logger.info(f"Deleted product: {sku}")
        
    except ValueError as e:
        logger.error(f"Validation error deleting product: {e}")
        raise
    except ClientError as e:
        logger.error(f"DynamoDB error deleting product: {e}")
        raise Exception(f"Failed to delete product: {e}")