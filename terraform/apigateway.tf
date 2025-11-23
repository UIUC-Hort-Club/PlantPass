# -------------------------
# API Gateway for Frontend Application
# -------------------------
resource "aws_apigatewayv2_api" "frontend_api" {
  name          = "PlantPassAPI"
  protocol_type = "HTTP"
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

resource "aws_apigatewayv2_route" "lambda_route" {
  api_id    = aws_apigatewayv2_api.frontend_api.id
  route_key = "ANY /lambda"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
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