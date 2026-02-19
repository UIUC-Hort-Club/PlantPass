/**
 * WebSocket configuration
 * The WebSocket URL should be set in the public/config.js file
 */

export function getWebSocketUrl() {
  // Check if WebSocket URL is configured
  if (window.APP_CONFIG && window.APP_CONFIG.WEBSOCKET_URL) {
    return window.APP_CONFIG.WEBSOCKET_URL;
  }
  
  // Return null if not configured (WebSocket will be disabled)
  console.warn('WebSocket URL not configured in APP_CONFIG');
  return null;
}
