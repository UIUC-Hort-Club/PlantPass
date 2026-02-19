/**
 * WebSocket URL from runtime config
 * In production: injected via config.js at deploy time
 * In development: falls back to WEBSOCKET_URL from .env
 */
const websocketUrl = window.APP_CONFIG?.WEBSOCKET_URL || import.meta.env.WEBSOCKET_URL;

if (!websocketUrl) {
  console.warn('WEBSOCKET_URL is not configured. Set WEBSOCKET_URL in .env for local development.');
}

export const WEBSOCKET_URL = websocketUrl;
