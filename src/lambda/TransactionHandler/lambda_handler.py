import json
import logging
from database_interface import save_transaction, get_transaction, update_transaction, delete_transaction

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        route_key = event.get("routeKey", "")
        path_params = event.get("pathParameters") or {}
        body = json.loads(event.get("body", "{}"))

        logger.info(f"Route: {route_key}, Path params: {path_params}, Body: {body}")

        # ---- Create transaction ----
        if route_key == "POST /transactions":
            transaction = save_transaction(body)
            logger.info(f"Transaction created: {transaction}")
            return response(201, {"transaction": transaction})

        # ---- Read transaction ----
        elif route_key == "GET /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                logger.warning("purchase_id missing in GET request")
                return response(400, {"message": "purchase_id required"})
            
            transaction = get_transaction(purchase_id)
            if not transaction:
                return response(404, {"message": "Transaction not found"})
            
            logger.info(f"Transaction retrieved: {transaction}")
            return response(200, transaction)

        # ---- Update transaction ----
        elif route_key == "PUT /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                return response(400, {"message": "purchase_id required"})
            
            updated_transaction = update_transaction(purchase_id, body)
            logger.info(f"Transaction updated: {updated_transaction}")
            return response(200, {"transaction": updated_transaction})

        # ---- Delete transaction ----
        elif route_key == "DELETE /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                return response(400, {"message": "purchase_id required"})
            
            delete_transaction(purchase_id)
            logger.info(f"Transaction deleted: {purchase_id}")
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
