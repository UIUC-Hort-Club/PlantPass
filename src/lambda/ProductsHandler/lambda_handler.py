import json
import logging
from database_interface import (
    get_all_products,
    replace_all_products
)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):    
    try:
        route_key = event.get("routeKey", "")
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        # ---- Get all products ----
        if route_key == "GET /products":
            products = get_all_products()
            logger.info(f"Retrieved {len(products)} products")
            return response(200, products)

        # ---- Replace all products ----
        elif route_key == "PUT /products":
            try:
                # Expect body to contain a list of products
                if not isinstance(body, list):
                    return response(400, {"message": "Request body must be a list of products"})
                
                result = replace_all_products(body)
                logger.info(f"Replaced products: {result}")
                return response(200, {"message": "Products replaced successfully", "result": result})
            except Exception as e:
                logger.error(f"Error replacing products: {e}", exc_info=True)
                return response(500, {"message": "Error replacing products", "error": str(e)})

        # ---- Unknown route ----
        else:
            logger.warning(f"Unknown route: {route_key}")
            return response(404, {"message": "Route not found"})

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return response(500, {"message": str(e)})

def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,PUT,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }
