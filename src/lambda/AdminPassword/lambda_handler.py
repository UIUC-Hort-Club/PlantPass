import json
import logging
import os
import boto3
import bcrypt
import jwt
import datetime
from response_utils import create_response
from temp_password_manager import (
    generate_temp_password,
    store_temp_password,
    get_temp_password_hash,
    delete_temp_password
)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client("s3")
bucket = os.environ["PASSWORD_BUCKET"]
key = os.environ["PASSWORD_KEY"]

JWT_SECRET = os.environ["JWT_SECRET"]
EMAIL_LAMBDA_ARN = os.environ.get("EMAIL_LAMBDA_ARN")

lambda_client = boto3.client('lambda')

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
            is_temp_password = body.get("is_temp_password", False)

            # Check regular password first
            if bcrypt.checkpw(password.encode(), pw_hash):
                token = jwt.encode(
                    {"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                    JWT_SECRET,
                    algorithm="HS256"
                )
                return create_response(200, {"token": token, "requires_password_change": False})
            
            # If not regular password and temp password flag is set, check temp password
            if is_temp_password:
                temp_hash = get_temp_password_hash()
                if temp_hash and bcrypt.checkpw(password.encode(), temp_hash.encode()):
                    # Generate token but require password change
                    token = jwt.encode(
                        {"exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
                         "temp": True},
                        JWT_SECRET,
                        algorithm="HS256"
                    )
                    delete_temp_password()
                    return create_response(200, {"token": token, "requires_password_change": True})
            
            return create_response(401, {"error": "Invalid password"})
        
        if route_key == "POST /admin/change-password":
            headers = event.get("headers", {})
            authorization = headers.get("authorization", "")
            token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else ""

            try:
                decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
                is_temp = decoded.get("temp", False)
            except jwt.ExpiredSignatureError:
                return create_response(401, {"error": "Token expired"})
            except:
                return create_response(401, {"error": "Invalid token"})

            old_pw = body.get("old_password", "")
            new_pw = body.get("new_password", "")

            # If using temp token, skip old password check
            if not is_temp:
                pw_hash = get_password_hash()
                if not bcrypt.checkpw(old_pw.encode(), pw_hash):
                    return create_response(401, {"error": "Invalid current password"})

            new_hash = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt())
            set_password_hash(new_hash)
            return create_response(200, {"success": True})

        if route_key == "POST /admin/forgot-password":
            # Generate temporary password
            temp_password = generate_temp_password()
            temp_hash = bcrypt.hashpw(temp_password.encode(), bcrypt.gensalt()).decode()
            
            # Store temp password hash
            store_temp_password(temp_hash)
            
            # Send email via Email Lambda
            if EMAIL_LAMBDA_ARN:
                try:
                    email_payload = {
                        "routeKey": "POST /email/password-reset",
                        "body": json.dumps({"temp_password": temp_password})
                    }
                    
                    lambda_client.invoke(
                        FunctionName=EMAIL_LAMBDA_ARN,
                        InvocationType='Event',
                        Payload=json.dumps(email_payload)
                    )
                    
                    logger.info("Password reset email triggered")
                except Exception as e:
                    logger.error(f"Failed to trigger email: {e}")
                    return create_response(500, {"error": "Failed to send email"})
            
            return create_response(200, {"message": "Temporary password sent to registered email"})

        return create_response(404, {"error": "Route not found"})

    except:
        logger.exception("Error processing request")
        return create_response(500, {"error": "Internal server error"})
