# -------------------------
# Lambda IAM Role
# -------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "plantpass_lambda_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })

  tags = {
    application = "plantpass"
  }
}

# Attach basic execution policy
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# S3 access policy for Admin Lambda
resource "aws_iam_role_policy" "lambda_s3_access" {
  name = "AdminLambdaS3Access"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = "${aws_s3_bucket.admin_password.arn}/*"
      }
    ]
  })
}

# -------------------------
# CloudWatch Log Group
# -------------------------
resource "aws_cloudwatch_log_group" "transaction_handler_logs" {
  name              = "/aws/lambda/TransactionHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

# -------------------------
# Lambda Functions
# -------------------------
# Transaction Lambda
resource "aws_lambda_function" "transaction_handler" {
  function_name = "TransactionHandler"
  filename      = var.lambda_zip_path
  handler       = "lambda_handler.lambda_handler"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256(var.lambda_zip_path)

  depends_on = [
    aws_cloudwatch_log_group.transaction_handler_logs
  ]

  tags = {
    application = "plantpass"
  }
}

# Admin Lambda
resource "aws_lambda_function" "admin" {
  function_name = "plantpass-admin"
  handler       = "admin.lambda_handler"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec.arn
  timeout       = 10

  environment {
    variables = {
      PASSWORD_BUCKET = aws_s3_bucket.admin_password.bucket
      PASSWORD_KEY    = "password.json"
      JWT_SECRET      = "super-secret-key"
    }
  }

  filename = var.admin_lambda_zip_path
}

# -------------------------
# Lambda Function URL (optional)
# -------------------------
resource "aws_lambda_function_url" "transaction_handler_url" {
  function_name      = aws_lambda_function.transaction_handler.function_name
  authorization_type = "NONE"
}

output "lambda_function_url" {
  value = aws_lambda_function_url.transaction_handler_url.function_url
  description = "Optional URL for the Transaction Lambda"
}

# -------------------------
# Lambda Permissions for API Gateway
# -------------------------
# Transaction Lambda
resource "aws_lambda_permission" "apigw_transaction" {
  statement_id  = "AllowAPIGatewayInvokeTransaction"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

# Admin Lambda
resource "aws_lambda_permission" "apigw_admin" {
  statement_id  = "AllowAPIGatewayInvokeAdmin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}
