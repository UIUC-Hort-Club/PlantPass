# -------------------------
# Lambda IAM Role
# -------------------------
resource "aws_iam_role" "lambda_exec" {
  name = "transaction_handler_lambda_role"
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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# -------------------------
# CloudWatch Log Group
# -------------------------
resource "aws_cloudwatch_log_group" "transaction_handler_logs" {
  name = "/aws/lambda/TransactionHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

# -------------------------
# Lambda Function
# -------------------------
resource "aws_lambda_function" "transaction_handler" {
  function_name = "TransactionHandler"
  filename      = var.lambda_zip_path
  handler       = "lambda_handler.lambda_handler"
  runtime       = "python3.11"
  role          = aws_iam_role.lambda_exec.arn

  # Ensure log group exists before Lambda deploys
  depends_on = [
    aws_cloudwatch_log_group.transaction_handler_logs
  ]

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function_url" "transaction_handler_url" {
  function_name      = aws_lambda_function.transaction_handler.function_name
  authorization_type = "NONE"
}

output "lambda_function_url" {
  value = aws_lambda_function_url.transaction_handler_url.function_url
}

variable "lambda_zip_path" {
  type        = string
  description = "Path to Lambda ZIP relative to Terraform working directory"
  default     = "lambda_package.zip"
}

# Grant API Gateway permission to invoke the Lambda function
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}
