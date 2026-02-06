// config.js

/**
 * API Gateway base URL from environment variable
 * Set API_ENDPOINT in .env for local development
 * Set as GitHub secret for CI/CD
 */
const apiEndpoint = import.meta.env.API_ENDPOINT;

if (!apiEndpoint) {
  console.error("API_ENDPOINT environment variable is not set");
}

export const API_URL = apiEndpoint;
