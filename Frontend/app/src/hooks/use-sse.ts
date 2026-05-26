/**
 * Server-Sent Events (SSE) Hook
 * Real-time updates for driver ratings, badges, and passenger notifications
 */

import { useEffect, useState } from 'react';
import { apiConfig } from '@/config/api';

export interface SSEOptions {
  onMessage?: (data: any) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  autoReconnect?: boolean;
}

/**
 * Hook for listening to driver live rating updates
 */
export const useDriverLiveRating = (driverId: number, options?: SSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const eventSource = new EventSource(
        `${apiConfig.baseURL}/driver/${driverId}/live`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onopen = () => {
        setIsConnected(true);
        options?.onConnect?.();
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
        options?.onMessage?.(parsedData);
      };

      eventSource.onerror = (evt) => {
        console.error('SSE Error:', evt);
        setIsConnected(false);
        const err = new Error('SSE Connection Error');
        setError(err);
        options?.onError?.(err);

        if (options?.autoReconnect !== false) {
          setTimeout(() => {
            eventSource.close();
          }, 3000);
        }
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
    }
  }, [driverId, options]);

  return { isConnected, data, error };
};

/**
 * Hook for listening to passenger review notifications
 */
export const usePassengerReviewNotifications = (passengerId: number, options?: SSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const eventSource = new EventSource(
        `${apiConfig.baseURL}/passenger/${passengerId}/reviewnotifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onopen = () => {
        setIsConnected(true);
        options?.onConnect?.();
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        setNotifications(prev => [parsedData, ...prev]);
        options?.onMessage?.(parsedData);
      };

      eventSource.onerror = (evt) => {
        console.error('SSE Error:', evt);
        setIsConnected(false);
        const err = new Error('SSE Connection Error');
        setError(err);
        options?.onError?.(err);

        if (options?.autoReconnect !== false) {
          setTimeout(() => {
            eventSource.close();
          }, 3000);
        }
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
    }
  }, [passengerId, options]);

  return { isConnected, notifications, error };
};

/**
 * Hook for listening to driver badge updates
 */
export const useDriverBadgesLive = (driverId: number, options?: SSEOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [badges, setBadges] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const eventSource = new EventSource(
        `${apiConfig.baseURL}/driver/${driverId}/badges/live`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      eventSource.onopen = () => {
        setIsConnected(true);
        options?.onConnect?.();
      };

      eventSource.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        setBadges(parsedData.badges || []);
        options?.onMessage?.(parsedData);
      };

      eventSource.onerror = (evt) => {
        console.error('SSE Error:', evt);
        setIsConnected(false);
        const err = new Error('SSE Connection Error');
        setError(err);
        options?.onError?.(err);

        if (options?.autoReconnect !== false) {
          setTimeout(() => {
            eventSource.close();
          }, 3000);
        }
      };

      return () => {
        eventSource.close();
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
    }
  }, [driverId, options]);

  return { isConnected, badges, error };
};
