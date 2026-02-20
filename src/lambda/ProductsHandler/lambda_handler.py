import json
import logging
from response_utils import create_response
from database_interface import (
    get_all_products,
    replace_all_products
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):    
    try:
        route_key = event.get("routeKey", "")
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        if route_key == "GET /products":
            products = get_all_products()
            return create_response(200, products)

        elif route_key == "PUT /products":
            if not isinstance(body, list):
                return create_response(400, {"message": "Request body must be a list of products"})
            
            result = replace_all_products(body)
            return create_response(200, {"message": "Products replaced successfully", "result": result})

        else:
            return create_response(404, {"message": "Route not found"})

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return create_response(500, {"message": str(e)})
