provider "aws" {
  region = "us-east-1"
}

# -------------------------
# S3 Bucket
# -------------------------
resource "aws_s3_bucket" "frontend" {
  bucket = "plantpass-frontend"
}

# Enable versioning in a separate resource
resource "aws_s3_bucket_versioning" "frontend_versioning" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

# -------------------------
# CloudFront OAI
# -------------------------
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for PlantPass frontend"
}

# -------------------------
# S3 Bucket Policy
# -------------------------
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

# -------------------------
# CloudFront Distribution
# -------------------------
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  default_root_object = "index.html"
  comment             = "PlantPass React frontend"

  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-PlantPass"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-PlantPass"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# -------------------------
# Outputs
# -------------------------
output "frontend_bucket_name" {
  value       = aws_s3_bucket.frontend.bucket
  description = "The S3 bucket for the frontend"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.frontend.domain_name
  description = "The CloudFront distribution domain name"
}
