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
table_name = os.environ.get('PRODUCTS_TABLE', 'products')
table = dynamodb.Table(table_name)

def get_all_products():
    """Return a list of all products ordered by sort_order."""
    try:
        response = table.scan()
        products = response.get('Items', [])
        
        # Convert all Decimal objects to appropriate types for JSON serialization
        for product in products:
            # Convert price_ea from Decimal to float
            if 'price_ea' in product and isinstance(product['price_ea'], Decimal):
                product['price_ea'] = float(product['price_ea'])
            
            # Convert sort_order from Decimal to int, default to 0 if missing
            if 'sort_order' in product:
                if isinstance(product['sort_order'], Decimal):
                    product['sort_order'] = int(product['sort_order'])
            else:
                product['sort_order'] = 0
        
        # Sort by sort_order
        products.sort(key=lambda x: x.get('sort_order', 0))
        
        logger.info(f"Retrieved {len(products)} products from database")
        return products
    except ClientError as e:
        logger.error(f"Error retrieving products: {e}")
        raise Exception(f"Failed to retrieve products: {e}")

def replace_all_products(products_data):
    """
    Replace all products in the database with the provided list.
    This will delete all existing products and create new ones.
    
    products_data: List of product dictionaries with keys:
    - SKU: str
    - item: str  
    - price_ea: float
    - sort_order: int
    """
    try:
        # First, get all existing products to delete them
        existing_products = get_all_products()
        
        # Delete all existing products
        with table.batch_writer() as batch:
            for product in existing_products:
                batch.delete_item(Key={'SKU': product['SKU']})
        
        logger.info(f"Deleted {len(existing_products)} existing products")
        
        # Create new products
        created_count = 0
        with table.batch_writer() as batch:
            for product_data in products_data:
                # Validate required fields
                if 'SKU' not in product_data or 'item' not in product_data or 'price_ea' not in product_data:
                    logger.warning(f"Skipping invalid product data: {product_data}")
                    continue
                
                item = {
                    'SKU': product_data['SKU'],
                    'item': product_data['item'],
                    'price_ea': Decimal(str(product_data['price_ea'])),
                    'sort_order': int(product_data.get('sort_order', 0))
                }
                
                batch.put_item(Item=item)
                created_count += 1
        
        logger.info(f"Created {created_count} new products")
        return {"deleted": len(existing_products), "created": created_count}
        
    except ClientError as e:
        logger.error(f"DynamoDB error replacing products: {e}")
        raise Exception(f"Failed to replace products: {e}")
    except Exception as e:
        logger.error(f"Error replacing products: {e}")
        raise Exception(f"Failed to replace products: {e}")