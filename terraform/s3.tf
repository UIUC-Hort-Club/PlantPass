# -------------------------
# S3 Bucket
# -------------------------
resource "aws_s3_bucket" "frontend" {
  bucket = "plantpass-frontend"

  tags = {
    application = "plantpass"
  }
}

resource "aws_s3_bucket_versioning" "frontend_versioning" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = {
          AWS = aws_cloudfront_origin_access_identity.oai.iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "The S3 bucket for the frontend"
}