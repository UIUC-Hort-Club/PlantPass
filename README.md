<img src="/src/PlantPassApp/public/plantpass_logo_transp.png" alt="PlantPass Banner" />

# PlantPass

PlantPass is an application developed for the UIUC Horticulture Club to streamline checkout processes at their flagship event, The Spring Plant Fair. The frontend is deployed on AWS Cloudfront and the backend uses Lambdas + DynamoDB. This is intended to be fast, easy to use by non-technical indivisuals, and track sales data for use in following events.

# Local Development

The frontend is located in `./src/PlantPassApp`. Run `npm install` and then `npm run dev` to start the local development environment. It should automatically connect to the backend, as there is not yet any authentication implemented there.

# Building Infrastructure

To create, modify, or delete aws resources this project uses terraform. The app will deploy everything on push or pull request to master branch