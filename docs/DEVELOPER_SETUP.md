# Developer Setup

This document includes the steps to get fully set up as a contributor: installing dependencies, configuring AWS access, running Terraform, and deploying code

## Clone Repository
** THis needs to be ssh
```bash
git clone https://github.com/UIUC-Hort-Club/PlantPass.git
cd PlantPass
```

## Install Required Tools

### Node.js 20+
Install via Volta, nvm, or direct download:
```bash
nvm install 20
nvm use 20
```

### Terraform 1.6+
Download: https://developer.hashicorp.com/terraform/downloads

Verify:
```bash
terraform -v
```

### AWS CLI v2
https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html

Verify:
``` bash
aws --version
```

## AWS Access Setup

These are the steps to get a developer set up with the project to begin contributing

### 1. Acquire AWS credentials

You will need the following:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

### 2. Configure the AWS CLI
```bash
aws configure
```

Enter the following:
```bash
AWS Access Key ID: <provided>
AWS Secret Access Key: <provided>
Default region: us-east-1
Default output: json
```

Verify Access:
```bash
aws sts get-caller-identity

# You should see the account ID...
```

## Local Development Setup
Local development setup such as local testing and iteration (e.g. running the development react app) can be found in the components indivisual readme.

## Deploying to Staging

Deployments happen automatically via GitHub Actions when you push to the `staging` branch.