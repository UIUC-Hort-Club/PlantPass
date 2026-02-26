import { useEffect, useRef, useCallback, useState } from 'react';

interface UseWebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  enabled?: boolean;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  connectionError: string | null;
  send: (data: unknown) => boolean;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * Custom hook for managing WebSocket connection with automatic reconnection.
 * 
 * @param url - WebSocket URL to connect to
 * @param onMessage - Callback function when message is received
 * @param options - Configuration options
 * @returns WebSocket connection state and methods
 */
export function useWebSocket(
  url: string | undefined,
  onMessage: (data: unknown) => void,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    enabled = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const onMessageRef = useRef<(data: unknown) => void>(onMessage);
  const mountedRef = useRef<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Keep onMessage ref up to date without triggering reconnections
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const disconnect = useCallback((): void => {
    // Clear any pending reconnection attempts
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close WebSocket connection
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      
      // Remove event listeners to prevent reconnection on manual close
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.onopen = null;
      
      // Only close if not already closed
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Manual disconnect');
      }
    }

    setIsConnected(false);
    reconnectAttemptsRef.current = 0;
  }, []);

  const connect = useCallback((): void => {
    // Don't connect if disabled, no URL, or component unmounted
    if (!enabled || !url || !mountedRef.current) {
      return;
    }

    // Prevent duplicate connections
    if (wsRef.current) {
      const readyState = wsRef.current.readyState;
      if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
        return;
      }
      // Clean up existing connection
      wsRef.current.close();
      wsRef.current = null;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = (): void => {
        if (!mountedRef.current) {
          ws.close();
          return;
        }
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event: MessageEvent): void => {
        if (!mountedRef.current) return;
        
        try {
          const data = JSON.parse(event.data as string);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (error) {
          console.error('WebSocket: Failed to parse message', error);
        }
      };

      ws.onerror = (): void => {
        if (!mountedRef.current) return;
        setConnectionError('Connection error');
      };

      ws.onclose = (event: CloseEvent): void => {
        if (!mountedRef.current) return;
        
        setIsConnected(false);
        wsRef.current = null;

        // Only reconnect on abnormal closures (not manual disconnects)
        if (event.code !== 1000 && enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connect();
            }
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setConnectionError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket: Failed to create connection', error);
      setConnectionError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [url, enabled, reconnectInterval, maxReconnectAttempts]);

  const send = useCallback((data: unknown): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('WebSocket: Failed to send message', error);
        return false;
      }
    }
    return false;
  }, []);

  // Connect on mount and when enabled changes
  useEffect(() => {
    mountedRef.current = true;
    
    if (enabled) {
      connect();
    }

    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    connectionError,
    send,
    disconnect,
    reconnect: connect,
  };
}
