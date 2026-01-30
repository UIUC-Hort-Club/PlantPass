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

    This is a backup function because SKU should come from frontend

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
    """Return a list of all products ordered by sort_order."""
    try:
        response = table.scan()
        products = response.get('Items', [])
        
        # Convert Decimal to float for JSON serialization
        for product in products:
            if 'price_ea' in product:
                product['price_ea'] = float(product['price_ea'])
            # Ensure sort_order exists, default to 0 if missing
            if 'sort_order' not in product:
                product['sort_order'] = 0
        
        # Sort by sort_order
        products.sort(key=lambda x: x.get('sort_order', 0))
        
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
    - SKU: str (optional - if not provided, will be auto-generated)
    - sort_order: int (optional - if not provided, will be set to next available)
    """
    try:
        # Validate required fields
        if 'item' not in product_data or 'price_ea' not in product_data:
            raise ValueError("Both 'item' and 'price_ea' are required")
        
        item_name = product_data['item']
        price_ea = Decimal(str(product_data['price_ea']))
        
        # Use provided SKU or generate one
        if 'SKU' in product_data and product_data['SKU'].strip():
            sku = product_data['SKU'].strip().upper()
        else:
            sku = generate_sku(item_name)
        
        # Set sort order
        if 'sort_order' in product_data:
            sort_order = int(product_data['sort_order'])
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
        
        # Check if SKU already exists
        try:
            existing = table.get_item(Key={'SKU': sku})
            if 'Item' in existing:
                raise ValueError(f"Product with SKU '{sku}' already exists")
        except ClientError as e:
            if e.response['Error']['Code'] != 'ResourceNotFoundException':
                raise
        
        # Create the product
        item = {
            'SKU': sku,
            'item': item_name,
            'price_ea': price_ea,
            'sort_order': sort_order
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
        
        # If SKU is being updated, we need to create a new item and delete the old one
        if 'SKU' in update_data and update_data['SKU'] != sku:
            new_sku = update_data['SKU'].strip().upper()
            
            # Check if new SKU already exists
            try:
                existing_new = table.get_item(Key={'SKU': new_sku})
                if 'Item' in existing_new:
                    raise ValueError(f"Product with SKU '{new_sku}' already exists")
            except ClientError as e:
                if e.response['Error']['Code'] != 'ResourceNotFoundException':
                    raise
            
            # Get current item data
            current_item = existing['Item']
            
            # Create new item with updated data
            new_item = {
                'SKU': new_sku,
                'item': update_data.get('item', current_item['item']),
                'price_ea': Decimal(str(update_data.get('price_ea', current_item['price_ea']))),
                'sort_order': int(update_data.get('sort_order', current_item.get('sort_order', 0)))
            }
            
            # Create new item and delete old one
            table.put_item(Item=new_item)
            table.delete_item(Key={'SKU': sku})
            
            # Return the new item with float conversion
            new_item['price_ea'] = float(new_item['price_ea'])
            logger.info(f"Updated product SKU from {sku} to {new_sku}: {new_item}")
            return new_item
        else:
            # Regular update without SKU change
            update_expression = "SET "
            expression_attribute_values = {}
            update_parts = []
            
            if 'item' in update_data:
                update_parts.append("item = :item")
                expression_attribute_values[':item'] = update_data['item']
            
            if 'price_ea' in update_data:
                update_parts.append("price_ea = :price_ea")
                expression_attribute_values[':price_ea'] = Decimal(str(update_data['price_ea']))
            
            if 'sort_order' in update_data:
                update_parts.append("sort_order = :sort_order")
                expression_attribute_values[':sort_order'] = int(update_data['sort_order'])
            
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