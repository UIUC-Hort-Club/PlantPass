/**
 * API Gateway base URL from runtime config
 * In production: injected via config.js at deploy time
 * In development: falls back to API_ENDPOINT from .env
 */
const apiEndpoint = window.APP_CONFIG?.API_ENDPOINT || import.meta.env.API_ENDPOINT;

if (!apiEndpoint) {
  console.error("API_ENDPOINT is not configured. Set API_ENDPOINT in .env for local development.");
}

export const API_URL = apiEndpoint;
