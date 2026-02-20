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

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

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

resource "aws_iam_role_policy" "lambda_dynamodb_access" {
  name = "LambdaDynamoDBAccess"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:BatchWriteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.discounts.arn,
          aws_dynamodb_table.products.arn,
          aws_dynamodb_table.transactions.arn,
          "${aws_dynamodb_table.transactions.arn}/index/*",
          aws_dynamodb_table.websocket_connections.arn,
          aws_dynamodb_table.temp_passwords.arn
        ]
      }
    ]
  })
}

resource "aws_cloudwatch_log_group" "transaction_handler_logs" {
  name              = "/aws/lambda/TransactionHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

resource "aws_cloudwatch_log_group" "admin_logs" {
  name              = "/aws/lambda/plantpass-admin"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

resource "aws_cloudwatch_log_group" "products_handler_logs" {
  name              = "/aws/lambda/ProductsHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

resource "aws_cloudwatch_log_group" "discounts_handler_logs" {
  name              = "/aws/lambda/DiscountsHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function" "transaction_handler" {
  function_name    = "TransactionHandler"
  filename         = var.transaction_lambda_zip_path
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256(var.transaction_lambda_zip_path)
  depends_on = [
    aws_cloudwatch_log_group.transaction_handler_logs
  ]

  environment {
    variables = {
      TRANSACTIONS_TABLE = aws_dynamodb_table.transactions.name
      CONNECTIONS_TABLE  = aws_dynamodb_table.websocket_connections.name
      WEBSOCKET_ENDPOINT = "https://${aws_apigatewayv2_api.websocket_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_apigatewayv2_stage.websocket_stage.name}"
      EMAIL_LAMBDA_ARN   = aws_lambda_function.email_handler.arn
    }
  }

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function" "admin" {
  function_name    = "plantpass-admin"
  filename         = var.admin_lambda_zip_path
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_exec.arn
  timeout          = 10
  source_code_hash = filebase64sha256(var.admin_lambda_zip_path)

  layers = [
    aws_lambda_layer_version.auth_deps.arn
  ]

  environment {
    variables = {
      PASSWORD_BUCKET = aws_s3_bucket.admin_password.bucket
      PASSWORD_KEY    = "password.json"
      JWT_SECRET      = "super-secret-key"
      EMAIL_LAMBDA_ARN = aws_lambda_function.email_handler.arn
      TEMP_PASSWORD_TABLE = aws_dynamodb_table.temp_passwords.name
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.admin_logs
  ]

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function" "products_handler" {
  function_name    = "ProductsHandler"
  filename         = var.products_lambda_zip_path
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256(var.products_lambda_zip_path)
  depends_on = [
    aws_cloudwatch_log_group.products_handler_logs
  ]

  environment {
    variables = {
      PRODUCTS_TABLE = aws_dynamodb_table.products.name
    }
  }

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function" "discounts_handler" {
  function_name    = "DiscountsHandler"
  filename         = var.discounts_lambda_zip_path
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256(var.discounts_lambda_zip_path)
  depends_on = [
    aws_cloudwatch_log_group.discounts_handler_logs
  ]

  environment {
    variables = {
      DISCOUNTS_TABLE = aws_dynamodb_table.discounts.name
    }
  }

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_permission" "apigw_transaction" {
  statement_id  = "AllowAPIGatewayInvokeTransaction"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.transaction_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_admin" {
  statement_id  = "AllowAPIGatewayInvokeAdmin"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.admin.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_products" {
  statement_id  = "AllowAPIGatewayInvokeProducts"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.products_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_discounts" {
  statement_id  = "AllowAPIGatewayInvokeDiscounts"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.discounts_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}

resource "aws_lambda_layer_version" "auth_deps" {
  layer_name          = "plantpass-auth-deps"
  filename            = var.auth_layer_zip_path
  compatible_runtimes = ["python3.11"]
}

# -------------------------
# Email Handler Lambda
# -------------------------

resource "aws_cloudwatch_log_group" "email_handler_logs" {
  name              = "/aws/lambda/EmailHandler"
  retention_in_days = 14

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_function" "email_handler" {
  function_name    = "EmailHandler"
  filename         = var.email_lambda_zip_path
  handler          = "lambda_handler.lambda_handler"
  runtime          = "python3.11"
  role             = aws_iam_role.lambda_exec.arn
  source_code_hash = filebase64sha256(var.email_lambda_zip_path)
  timeout          = 30
  depends_on = [
    aws_cloudwatch_log_group.email_handler_logs
  ]

  environment {
    variables = {
      SENDER_EMAIL          = var.sender_email
      UIUC_HORT_CLUB_EMAIL = var.uiuc_hort_club_email
    }
  }

  tags = {
    application = "plantpass"
  }
}

resource "aws_lambda_permission" "apigw_email" {
  statement_id  = "AllowAPIGatewayInvokeEmail"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.email_handler.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.frontend_api.execution_arn}/*/*"
}
