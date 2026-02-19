import json
import logging
from database_interface import (
    create_transaction,
    read_transaction,
    update_transaction,
    delete_transaction,
    get_recent_unpaid_transactions
)
from sales_analytics import (
    compute_sales_analytics,
    export_transaction_data,
    clear_all_transactions
)
from csv_export import generate_csv_export

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        route_key = event.get("routeKey", "")
        path_params = event.get("pathParameters") or {}
        body = json.loads(event.get("body", "{}"))

        logger.info(f"Route: {route_key}, Path params: {path_params}, Body: {body}")

        if route_key == "POST /transactions":
            try:
                transaction = create_transaction(body)
                logger.info("Transaction saved successfully")
                return response(201, {"message": "Transaction created successfully", "transaction": transaction})
            except Exception as e:
                logger.error(f"Error saving transaction: {e}", exc_info=True)
                return response(500, {"message": "Error saving transaction", "error": str(e)})

        elif route_key == "GET /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                logger.warning("purchase_id missing in GET request")
                return response(400, {"message": "purchase_id required"})
            
            transaction = read_transaction(purchase_id)
            if not transaction:
                return response(404, {"message": "Transaction not found"})
            
            logger.info(f"Transaction retrieved: {transaction}")
            return response(200, transaction)
        
        elif route_key == "GET /transactions/recent-unpaid":
            # Get limit from query parameters, default to 5
            query_params = event.get("queryStringParameters") or {}
            limit = int(query_params.get("limit", 5))
            
            recent_transactions = get_recent_unpaid_transactions(limit)
            logger.info(f"Retrieved {len(recent_transactions)} recent unpaid transactions")
            return response(200, {"transactions": recent_transactions})

        elif route_key == "PUT /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                return response(400, {"message": "purchase_id required"})
            
            updated_transaction = update_transaction(purchase_id, body)
            logger.info(f"Transaction updated: {updated_transaction}")
            return response(200, {"transaction": updated_transaction})

        elif route_key == "DELETE /transactions/{purchase_id}":
            purchase_id = path_params.get("purchase_id")
            if not purchase_id:
                return response(400, {"message": "purchase_id required"})
            
            delete_transaction(purchase_id)
            logger.info(f"Transaction deleted: {purchase_id}")
            return response(204, {})  # 204 No Content
        
        elif route_key == "GET /transactions/sales-analytics":
            analytics = compute_sales_analytics()
            logger.info(f"Analytics computed: {analytics}")
            return response(200, analytics)

        elif route_key == "GET /transactions/export-data":
            transactions = export_transaction_data()
            csv_export = generate_csv_export(transactions)
            
            logger.info(f"Generated CSV export: {csv_export['filename']}")
            
            # Return base64-encoded zip file
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "filename": csv_export['filename'],
                    "content": csv_export['content'],
                    "content_type": csv_export['content_type']
                })
            }

        elif route_key == "DELETE /transactions/clear-all":
            cleared_count = clear_all_transactions()
            logger.info(f"Cleared {cleared_count} transactions")
            return response(200, {"message": f"Successfully cleared {cleared_count} transactions", "cleared_count": cleared_count})

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
