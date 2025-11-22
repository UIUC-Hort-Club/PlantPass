# Terraform

This doicument explains how to locally build and deploy the PlantPass infrastructure using Terraform.
This assumes you have completed [developer setup](docs/DEVELOPER_SETUP.md)

## Frontend Deployment

1. Build the Frontend
```bash
cd ../PlantPassApp
npm install
npm run build
```

2. Navigate to Terraform directory
```bash
cd ../terraform
```

3. Initialize TF
```bash
terraform init
```

4. Plan TF Changes
```bash
terraform plan
```

5. Apply TF Changes
```bash
terraform apply
```

6. Sync Frontend to S3 Bucket
```bash
BUCKET_NAME=$(terraform output -raw frontend_bucket_name)
aws s3 sync ../PlantPassApp/dist/ s3://$BUCKET_NAME --delete
```

7. Verify deployment
Access the S3 bucket website or CloudFront distribution URL to confirm the frontend is live.