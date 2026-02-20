import json
import logging
from response_utils import create_response
from database_interface import (
    get_all_payment_methods,
    replace_all_payment_methods
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        route_key = event.get("routeKey", "")
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        if route_key == "GET /payment-methods":
            payment_methods = get_all_payment_methods()
            return create_response(200, payment_methods)

        elif route_key == "PUT /payment-methods":
            if not isinstance(body, list):
                return create_response(400, {"message": "Request body must be a list of payment methods"})
            
            result = replace_all_payment_methods(body)
            return create_response(200, {"message": "Payment methods replaced successfully", "result": result})

        else:
            return create_response(404, {"message": "Route not found"})

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return create_response(500, {"message": str(e)})
