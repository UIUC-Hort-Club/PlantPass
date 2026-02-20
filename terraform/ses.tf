# -------------------------
# SES Email Configuration
# -------------------------

# SES Email Identity (Domain or Email)
resource "aws_ses_email_identity" "sender" {
  email = var.sender_email
}

# SES Email Identity for UIUC Hort Club
resource "aws_ses_email_identity" "uiuc_hort_club" {
  email = var.uiuc_hort_club_email
}

# IAM Policy for Lambda to send emails via SES
resource "aws_iam_role_policy" "lambda_ses_access" {
  name = "LambdaSESAccess"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Policy for AdminPassword Lambda to invoke Email Lambda
resource "aws_iam_role_policy" "lambda_invoke_email" {
  name = "LambdaInvokeEmailLambda"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.email_handler.arn
      }
    ]
  })
}
