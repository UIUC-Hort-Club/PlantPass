# -------------------------
# API Gateway for Frontend Application
# -------------------------
resource "aws_apigatewayv2_api" "frontend_api" {
  name          = "PlantPassAPI"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]  # or your CloudFront domain
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type"]
  }

  tags = {
    application = "plantpass"
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.frontend_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.transaction_handler.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.frontend_api.id
  name        = "$default"
  auto_deploy = true
  tags = {
    application = "plantpass"
  }
}

output "api_endpoint" {
  value = aws_apigatewayv2_stage.default.invoke_url
}

# Define routes for the API Gateway
resource "aws_apigatewayv2_route" "write_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /write"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "read_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /read"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "total_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "POST /total"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}
