/**
 * Alerts API Service
 * Handles alert creation, retrieval, and deletion
 */

import httpClient from '@/lib/http-client';
import { apiConfig } from '@/config/api';
import type { Alert } from '@/types';

export interface CreateAlertRequest {
  departure: string;
  destination: string;
  date?: string;
}

export const alertsService = {
  /**
   * Get all user alerts
   */
  getAlerts: async (): Promise<Alert[]> => {
    const response = await httpClient.get(apiConfig.endpoints.alerts.list);
    return response.data;
  },

  /**
   * Create a new alert
   */
  createAlert: async (data: CreateAlertRequest): Promise<Alert> => {
    const response = await httpClient.post(apiConfig.endpoints.alerts.create, data);
    return response.data;
  },

  /**
   * Delete an alert
   */
  deleteAlert: async (alertId: number): Promise<void> => {
    await httpClient.delete(apiConfig.endpoints.alerts.delete(alertId));
  },
};
