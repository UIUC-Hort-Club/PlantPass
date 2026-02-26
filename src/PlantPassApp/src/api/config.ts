// Extend Window interface to include APP_CONFIG
declare global {
  interface Window {
    APP_CONFIG?: {
      API_ENDPOINT?: string;
      WEBSOCKET_URL?: string;
    };
  }
}

// Extend ImportMeta interface for Vite env variables
interface ImportMetaEnv {
  readonly API_ENDPOINT?: string;
  readonly WEBSOCKET_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const apiEndpoint: string | undefined = window.APP_CONFIG?.API_ENDPOINT || import.meta.env.API_ENDPOINT;

if (!apiEndpoint) {
  console.error("API_ENDPOINT is not configured. Set API_ENDPOINT in .env for local development.");
}

const websocketUrl: string | undefined = window.APP_CONFIG?.WEBSOCKET_URL || import.meta.env.WEBSOCKET_URL;

if (!websocketUrl) {
  console.warn('WEBSOCKET_URL is not configured. Set WEBSOCKET_URL in .env for local development.');
}

export const API_URL: string | undefined = apiEndpoint;
export const WEBSOCKET_URL: string | undefined = websocketUrl;
