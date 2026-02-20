import json
import logging
import os
import boto3
import bcrypt
import jwt
import datetime
from response_utils import create_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
bucket = os.environ["PASSWORD_BUCKET"]
key = os.environ["PASSWORD_KEY"]

JWT_SECRET = os.environ["JWT_SECRET"]
RESET_TOKEN_HASH = os.environ.get("RESET_TOKEN_HASH")
RESET_ENABLED = os.environ.get("RESET_ENABLED") == "true"

def get_password_hash():
    obj = s3.get_object(Bucket=bucket, Key=key)
    data = json.loads(obj["Body"].read())
    return data["admin_password_hash"].encode()

def set_password_hash(new_hash):
    s3.put_object(
        Bucket=bucket,
        Key=key,
        Body=json.dumps({"admin_password_hash": new_hash.decode()})
    )

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        route_key = event.get("routeKey", "")

        if route_key == "POST /admin/login":
            pw_hash = get_password_hash()
            password = body.get("password", "")

            if bcrypt.checkpw(password.encode(), pw_hash):
                token = jwt.encode(
                    {"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                    JWT_SECRET,
                    algorithm="HS256"
                )
                return create_response(200, {"token": token})
            return create_response(401, {"error": "Invalid password"})
        
        if route_key == "POST /admin/change-password":
            headers = event.get("headers", {})
            authorization = headers.get("authorization", "")
            token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else ""

            try:
                jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return create_response(401, {"error": "Token expired"})
            except:
                return create_response(401, {"error": "Invalid token"})

            old_pw = body.get("old_password", "")
            new_pw = body.get("new_password", "")

            pw_hash = get_password_hash()
            if not bcrypt.checkpw(old_pw.encode(), pw_hash):
                return create_response(401, {"error": "Invalid current password"})

            new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt())
            set_password_hash(new_hash)
            return create_response(200, {"success": True})

        if route_key == "POST/admin/reset-password":
            reset_token = event["headers"].get("X-Reset-Token", "")
            if not RESET_ENABLED:
                return create_response(404, {"error": "Password reset is disabled"})
            if not bcrypt.checkpw(reset_token.encode(), RESET_TOKEN_HASH.encode()):
                return create_response(401, {"error": "Invalid reset token"})

            new_pw = body.get("new_password", "")
            new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt())
            set_password_hash(new_hash)
            return create_response(200, {"success": True})

        return create_response(404, {"error": "Route not found"})

    except:
        logger.exception("Error processing request")
        return create_response(500, {"error": "Internal server error"})
