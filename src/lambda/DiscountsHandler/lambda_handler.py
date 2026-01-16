import json
import logging
from database_interface import (
    get_all_discounts,
    create_discount,
    update_discount,
    delete_discount
)

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        route_key = event.get("routeKey", "")
        path_params = event.get("pathParameters") or {}
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        logger.info(f"Route: {route_key}, Path params: {path_params}, Body: {body}")

        # ---- Get all discounts ----
        if route_key == "GET /discounts":
            discounts = get_all_discounts()
            logger.info(f"Retrieved {len(discounts)} discounts")
            return response(200, discounts)

        # ---- Create discount ----
        elif route_key == "POST /discounts":
            try:
                discount = create_discount(body)
                logger.info(f"Discount created: {discount}")
                return response(201, {"message": "Discount created successfully", "discount": discount})
            except Exception as e:
                logger.error(f"Error creating discount: {e}", exc_info=True)
                return response(500, {"message": "Error creating discount", "error": str(e)})

        # ---- Update discount ----
        elif route_key == "PUT /discounts/{name}":
            name = path_params.get("name")
            if not name:
                return response(400, {"message": "Discount name required"})
            
            updated_discount = update_discount(name, body)
            logger.info(f"Discount updated: {updated_discount}")
            return response(200, {"discount": updated_discount})

        # ---- Delete discount ----
        elif route_key == "DELETE /discounts/{name}":
            name = path_params.get("name")
            if not name:
                return response(400, {"message": "Discount name required"})
            
            delete_discount(name)
            logger.info(f"Discount deleted: {name}")
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
