import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { tokenStorage } from '../utils/tokenStorage';

/**
 * WebSocket hook for live bidding.
 *
 * Expected backend WS URL (to implement later with Django Channels):
 * ws://localhost:8000/ws/auctions/<auctionId>/?token=<access>
 */
export function useAuctionWebSocket(auctionId) {
  const [status, setStatus] = useState('disconnected'); // disconnected | connecting | connected | error
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  const wsUrl = useMemo(() => {
    if (!auctionId) return null;
    const access = tokenStorage.getAccess();
    const tokenQuery = access ? `?token=${encodeURIComponent(access)}` : '';
    return `ws://localhost:8000/ws/auctions/${auctionId}/${tokenQuery}`;
  }, [auctionId]);

  const connect = useCallback(() => {
    if (!wsUrl) return;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setStatus('connecting');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus('connected');
    ws.onerror = () => setStatus('error');
    ws.onclose = () => setStatus('disconnected');
    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);
        setEvents((prev) => [data, ...prev].slice(0, 50));
      } catch {
        // ignore malformed messages
      }
    };
  }, [wsUrl]);

  const disconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { status, events, connect, disconnect, send };
}

