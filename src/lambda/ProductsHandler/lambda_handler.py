import json
import logging
from database_interface import (
    get_all_products,
    create_product,
    update_product,
    delete_product
)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):    
    try:
        route_key = event.get("routeKey", "")
        path_params = event.get("pathParameters") or {}
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        # ---- Get all products ----
        if route_key == "GET /products":
            products = get_all_products()
            logger.info(f"Retrieved {len(products)} products")
            return response(200, products)

        # ---- Create product ----
        elif route_key == "POST /products":
            try:
                product = create_product(body)
                logger.info(f"Product created: {product}")
                return response(201, {"message": "Product created successfully", "product": product})
            except Exception as e:
                logger.error(f"Error creating product: {e}", exc_info=True)
                return response(500, {"message": "Error creating product", "error": str(e)})

        # ---- Update product ----
        elif route_key == "PUT /products/{SKU}":
            SKU = path_params.get("SKU")
            if not SKU:
                return response(400, {"message": "SKU required"})

            updated_product = update_product(SKU, body)
            logger.info(f"Product updated: {updated_product}")
            return response(200, {"product": updated_product})

        # ---- Delete product ----
        elif route_key == "DELETE /products/{SKU}":
            SKU = path_params.get("SKU")
            if not SKU:
                return response(400, {"message": "SKU required"})

            delete_product(SKU)
            logger.info(f"Product deleted: {SKU}")
            return response(204, {})  # 204 No Content

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
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        },
        "body": json.dumps(body)
    }
