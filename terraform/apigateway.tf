# -------------------------
# API Gateway for Frontend Application
# -------------------------
resource "aws_apigatewayv2_api" "frontend_api" {
  name          = "PlantPassAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }

  tags = {
    application = "plantpass"
  }
}

# -------------------------
# Lambda Integrations
# -------------------------
resource "aws_apigatewayv2_integration" "transaction_lambda_integration" {
  api_id                 = aws_apigatewayv2_api.frontend_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.transaction_handler.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_integration" "admin_lambda_integration" {
  api_id                 = aws_apigatewayv2_api.frontend_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.admin.arn
  payload_format_version = "2.0"
}

# -------------------------
# API Gateway Stage
# -------------------------
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.frontend_api.id
  name        = "$default"
  auto_deploy = true

  tags = {
    application = "plantpass"
  }
}

# -------------------------
# Transaction Lambda Routes
# -------------------------
resource "aws_apigatewayv2_route" "write_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /write"
  target    = "integrations/${aws_apigatewayv2_integration.transaction_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "read_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /read"
  target    = "integrations/${aws_apigatewayv2_integration.transaction_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "total_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /total"
  target    = "integrations/${aws_apigatewayv2_integration.transaction_lambda_integration.id}"
}

# -------------------------
# Admin Lambda Routes
# -------------------------
resource "aws_apigatewayv2_route" "admin_login_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /admin/login"
  target    = "integrations/${aws_apigatewayv2_integration.admin_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "admin_change_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /admin/change-password"
  target    = "integrations/${aws_apigatewayv2_integration.admin_lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "admin_reset_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /admin/reset-password"
  target    = "integrations/${aws_apigatewayv2_integration.admin_lambda_integration.id}"
}

# -------------------------
# Outputs
# -------------------------
output "api_endpoint" {
  value       = aws_apigatewayv2_stage.default.invoke_url
  description = "API Gateway endpoint for frontend and admin"
}
