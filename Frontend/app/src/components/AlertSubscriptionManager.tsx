/**
 * AlertSubscriptionManager
 * Opens a WebSocket subscription for each unique alert route (departure/destination).
 * When the backend publishes a tripMatchedAlert, this component fires addNotification()
 * so the user sees a real-time notification in the existing notification panel.
 *
 * This component renders nothing — it only manages WebSocket side-effects.
 */

import { useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { apiConfig } from '@/config/api';

interface AlertKey {
  from: string;
  to: string;
}

function alertKeyString(k: AlertKey): string {
  return `${k.from.toLowerCase()}::${k.to.toLowerCase()}`;
}

export default function AlertSubscriptionManager() {
  const { alerts, isAuthenticated, addNotification } = useApp();
  const wsMapRef = useRef<Map<string, WebSocket>>(new Map());
  const addNotificationRef = useRef(addNotification);

  // Keep the callback ref fresh without triggering reconnects
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Close all sockets when logged out
      wsMapRef.current.forEach((ws) => ws.close());
      wsMapRef.current.clear();
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Deduplicate alerts by departure/destination pair
    const needed = new Map<string, AlertKey>();
    for (const alert of alerts) {
      const key: AlertKey = { from: alert.departure, to: alert.destination };
      needed.set(alertKeyString(key), key);
    }

    // Close sockets that are no longer needed (alert was deleted)
    wsMapRef.current.forEach((ws, key) => {
      if (!needed.has(key)) {
        ws.close();
        wsMapRef.current.delete(key);
      }
    });

    // Open sockets for new alert routes
    const wsUrl = apiConfig.baseURL.replace(/^http/, 'ws');

    needed.forEach((alertKey, keyStr) => {
      if (wsMapRef.current.has(keyStr)) return; // already connected

      const connect = () => {
        // graphql-ws library expects 'graphql-transport-ws' subprotocol
        const ws = new WebSocket(`${wsUrl}/graphql`, ['graphql-transport-ws']);

        ws.onopen = () => {
          console.log(`🔔 [AlertSub] Connected for ${alertKey.from} → ${alertKey.to}`);
          // Step 1: Send ConnectionInit
          ws.send(JSON.stringify({ type: 'connection_init' }));
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);

            // Step 2: Once server sends connection_ack, send the subscription
            if (parsed.type === 'connection_ack') {
              console.log(`✅ [AlertSub] Acknowledged, subscribing for ${alertKey.from} → ${alertKey.to}`);
              ws.send(JSON.stringify({
                id: keyStr,
                type: 'subscribe',
                payload: {
                  query: `subscription { tripCreated(from: "${alertKey.from}", to: "${alertKey.to}") { tripId departure destination date } }`,
                },
              }));
              return;
            }

            // Step 3: Handle incoming trip notifications
            if (parsed.type === 'next' && parsed.payload?.data?.tripCreated) {
              const trip = parsed.payload.data.tripCreated;
              const dateStr = new Date(trip.date).toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });

              addNotificationRef.current({
                type: 'info',
                message: '🚗 Nouveau trajet correspondant à votre alerte !',
                details: `${trip.departure} → ${trip.destination} le ${dateStr}`,
              });
            }
          } catch (err) {
            // Ignore non-JSON frames
          }
        };

        ws.onerror = () => {
          console.warn(`⚠️ [AlertSub] WS error for ${alertKey.from} → ${alertKey.to}`);
        };

        ws.onclose = () => {
          console.log(`🔕 [AlertSub] Disconnected for ${alertKey.from} → ${alertKey.to}`);
          // Auto-reconnect after 5s if this alert is still tracked
          setTimeout(() => {
            if (wsMapRef.current.get(keyStr) === ws) {
              wsMapRef.current.delete(keyStr);
              connect();
            }
          }, 5000);
        };

        wsMapRef.current.set(keyStr, ws);
      };

      connect();
    });

    // Cleanup on unmount
    return () => {
      wsMapRef.current.forEach((ws) => ws.close());
      wsMapRef.current.clear();
    };
  }, [alerts, isAuthenticated]);

  // This component renders nothing
  return null;
}
