/**
 * WebSocket configuration
 * The WebSocket URL should be set in the public/config.js file
 */

export function getWebSocketUrl() {
  if (window.APP_CONFIG && window.APP_CONFIG.WEBSOCKET_URL) {
    return window.APP_CONFIG.WEBSOCKET_URL;
  }
  
  console.warn('WebSocket URL not configured in APP_CONFIG');
  return null;
}
