/**
 * WebSocket Subscriptions Hook
 * Real-time GraphQL subscriptions for trips and bookings
 */

import { useEffect, useState } from 'react';
import { apiConfig } from '@/config/api';

export interface SubscriptionOptions {
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  autoReconnect?: boolean;
}

/**
 * Hook for listening to tripCreated subscription
 * Notifies when a new trip is created matching the criteria
 */
export const useTripCreatedSubscription = (
  from: string,
  to: string,
  options?: SubscriptionOptions
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsUrl = apiConfig.baseURL.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(`${wsUrl}/graphql`, ['graphql-ws']);

        ws.onopen = () => {
          setIsConnected(true);
          options?.onConnect?.();

          // Send subscription
          const subscription = {
            id: '1',
            type: 'start',
            payload: {
              query: `
                subscription {
                  tripCreated(from: "${from}", to: "${to}") {
                    tripId
                    departure
                    destination
                    date
                  }
                }
              `,
            },
          };
          ws?.send(JSON.stringify(subscription));
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'data' && parsedData.payload?.data) {
              const tripData = parsedData.payload.data.tripCreated;
              setTrips(prev => [tripData, ...prev]);
              options?.onData?.(tripData);
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        ws.onerror = (evt) => {
          console.error('WS Error:', evt);
          setIsConnected(false);
          const err = new Error('WebSocket Connection Error');
          setError(err);
          options?.onError?.(err);
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (options?.autoReconnect !== false) {
            reconnectTimeout = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [from, to, options]);

  return { isConnected, trips, error };
};

/**
 * Hook for listening to bookingConfirmed subscription
 */
export const useBookingConfirmedSubscription = (
  userId: number,
  options?: SubscriptionOptions
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsUrl = apiConfig.baseURL.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(`${wsUrl}/graphql`, ['graphql-ws']);

        ws.onopen = () => {
          setIsConnected(true);
          options?.onConnect?.();

          // Send subscription
          const subscription = {
            id: '1',
            type: 'start',
            payload: {
              query: `
                subscription {
                  bookingConfirmed(userId: ${userId}) {
                    bookingId
                    passengerId
                    tripId
                  }
                }
              `,
            },
          };
          ws?.send(JSON.stringify(subscription));
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'data' && parsedData.payload?.data) {
              const bookingData = parsedData.payload.data.bookingConfirmed;
              setBookings(prev => [bookingData, ...prev]);
              options?.onData?.(bookingData);
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        ws.onerror = (evt) => {
          console.error('WS Error:', evt);
          setIsConnected(false);
          const err = new Error('WebSocket Connection Error');
          setError(err);
          options?.onError?.(err);
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (options?.autoReconnect !== false) {
            reconnectTimeout = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [userId, options]);

  return { isConnected, bookings, error };
};

/**
 * Hook for listening to tripCancelled subscription
 */
export const useTripCancelledSubscription = (
  userId: number,
  options?: SubscriptionOptions
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [cancelledTrips, setCancelledTrips] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const wsUrl = apiConfig.baseURL.replace(/^http/, 'ws');
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(`${wsUrl}/graphql`, ['graphql-ws']);

        ws.onopen = () => {
          setIsConnected(true);
          options?.onConnect?.();

          // Send subscription
          const subscription = {
            id: '1',
            type: 'start',
            payload: {
              query: `
                subscription {
                  tripCancelled(userId: ${userId}) {
                    tripId
                    reason
                  }
                }
              `,
            },
          };
          ws?.send(JSON.stringify(subscription));
        };

        ws.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            if (parsedData.type === 'data' && parsedData.payload?.data) {
              const tripData = parsedData.payload.data.tripCancelled;
              setCancelledTrips(prev => [tripData, ...prev]);
              options?.onData?.(tripData);
            }
          } catch (err) {
            console.error('Failed to parse WS message:', err);
          }
        };

        ws.onerror = (evt) => {
          console.error('WS Error:', evt);
          setIsConnected(false);
          const err = new Error('WebSocket Connection Error');
          setError(err);
          options?.onError?.(err);
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (options?.autoReconnect !== false) {
            reconnectTimeout = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, [userId, options]);

  return { isConnected, cancelledTrips, error };
};
