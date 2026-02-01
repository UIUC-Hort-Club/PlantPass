import json
import logging
from decimal import Decimal
from database_interface import (
    get_all_discounts,
    replace_all_discounts
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def decimal_to_float(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(v) for v in obj]
    return obj

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        route_key = event.get("routeKey", "")
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        logger.info(f"Route: {route_key}, Body: {body}")

        if route_key == "GET /discounts":
            try:
                discounts = get_all_discounts()
                logger.info(f"Retrieved {len(discounts)} discounts")
                discounts_serializable = decimal_to_float(discounts)
                logger.info(f"Serializable discounts: {discounts_serializable}")
                return response(200, discounts_serializable)
            except Exception as e:
                logger.error(f"Error in GET /discounts: {e}", exc_info=True)
                return response(500, {"message": "Error retrieving discounts", "error": str(e)})

        elif route_key == "PUT /discounts":
            try:
                if not isinstance(body, list):
                    return response(400, {"message": "Request body must be a list of discounts"})
                
                result = replace_all_discounts(body)
                logger.info(f"Replaced discounts: {result}")
                # Convert Decimal objects to float for JSON serialization
                result_serializable = decimal_to_float(result)
                return response(200, {"message": "Discounts replaced successfully", "result": result_serializable})
            except Exception as e:
                logger.error(f"Error replacing discounts: {e}", exc_info=True)
                return response(500, {"message": "Error replacing discounts", "error": str(e)})

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
