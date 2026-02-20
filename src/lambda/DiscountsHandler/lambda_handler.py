import json
import logging
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'shared'))
from response_utils import create_response
from decimal_utils import decimal_to_float
from database_interface import (
    get_all_discounts,
    replace_all_discounts
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    try:
        route_key = event.get("routeKey", "")
        body = json.loads(event.get("body", "{}")) if event.get("body") else {}

        if route_key == "GET /discounts":
            discounts = get_all_discounts()
            discounts_serializable = decimal_to_float(discounts)
            return create_response(200, discounts_serializable)

        elif route_key == "PUT /discounts":
            if not isinstance(body, list):
                return create_response(400, {"message": "Request body must be a list of discounts"})
            
            result = replace_all_discounts(body)
            result_serializable = decimal_to_float(result)
            return create_response(200, {"message": "Discounts replaced successfully", "result": result_serializable})

        else:
            return create_response(404, {"message": "Route not found"})

    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return create_response(500, {"message": str(e)})
