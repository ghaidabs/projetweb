/**
 * HTTP Client Setup with Axios
 * Provides a configured axios instance with interceptors for auth & error handling
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from '@/config/api';

interface CustomAxiosConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

class HttpClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{ onSuccess: (token: string) => void; onFailed: (error: Error) => void }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 [HttpClient] Token added to request:', config.method?.toUpperCase(), config.url);
        } else {
          console.log('⚠️ [HttpClient] No token in localStorage for request:', config.url);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: Handle token refresh & errors
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ [HttpClient] Response success:', response.status, response.config.method?.toUpperCase(), response.config.url);
        return response;
      },
      (error: AxiosError) => this.handleError(error)
    );
  }

  private handleError = async (error: AxiosError) => {
    const config = error.config as CustomAxiosConfig;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && config && !config._retry) {
      console.log('⚠️ [HttpClient] 401 Error detected on:', config.url);
      
      // Don't attempt refresh for auth endpoints (login/register always return 401 on invalid credentials)
      const isAuthEndpoint = config.url?.includes('/auth/login') || 
                             config.url?.includes('/auth/register');
      
      if (isAuthEndpoint) {
        console.log('🔐 [HttpClient] Auth endpoint detected - no refresh needed');
        // For login/register failures, just return the error without clearing auth
        return Promise.reject(error);
      }

      config._retry = true;
      console.log('🔄 [HttpClient] Attempting token refresh...');

      if (!this.isRefreshing) {
        this.isRefreshing = true;
        console.log('🔄 [HttpClient] Starting refresh process (not already refreshing)');
        
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          console.log('🔑 [HttpClient] RefreshToken found:', refreshToken ? 'YES' : 'NO');
          
          if (!refreshToken) {
            console.error('❌ [HttpClient] No refresh token in localStorage - clearing auth');
            this.clearAuth();
            return Promise.reject(error);
          }

          console.log('📡 [HttpClient] POST /auth/refresh - requesting new tokens...');
          const response = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          console.log('✅ [HttpClient] Token refresh succeeded!');
          console.log('✅ [HttpClient] New access token received:', newAccessToken.substring(0, 20) + '...');
          
          localStorage.setItem('accessToken', newAccessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          console.log('💾 [HttpClient] New tokens saved to localStorage');

          this.isRefreshing = false;
          this.processQueue(null, newAccessToken);
          console.log('✅ [HttpClient] Processing queued requests with new token...');

          // Retry original request
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('🔄 [HttpClient] Retrying original request:', config.method?.toUpperCase(), config.url);
          return this.client(config);
        } catch (refreshError) {
          console.error('❌ [HttpClient] Token refresh failed:', refreshError);
          this.isRefreshing = false;
          this.processQueue(refreshError, null);
          console.log('🚨 [HttpClient] Clearing auth and redirecting to home');
          this.clearAuth();
          return Promise.reject(refreshError);
        }
      } else {
        console.log('⏳ [HttpClient] Refresh already in progress - queueing this request');
      }

      // Queue the request if already refreshing
      return new Promise((resolve, reject) => {
        this.failedQueue.push({
          onSuccess: (token: string) => {
            console.log('✅ [HttpClient] Queued request resumed with new token');
            config.headers.Authorization = `Bearer ${token}`;
            resolve(this.client(config));
          },
          onFailed: (err) => {
            console.error('❌ [HttpClient] Queued request failed:', err);
            reject(err);
          },
        });
      });
    }

    return Promise.reject(error);
  };

  private processQueue = (error: any, token: string | null) => {
    console.log(`📊 [HttpClient] Processing queue - ${this.failedQueue.length} requests queued`);
    this.failedQueue.forEach((prom, index) => {
      if (error) {
        console.log(`❌ [HttpClient] Queue[${index}] - rejecting due to error`);
        prom.onFailed(error);
      } else if (token) {
        console.log(`✅ [HttpClient] Queue[${index}] - resolving with new token`);
        prom.onSuccess(token);
      }
    });
    this.failedQueue = [];
  };

  private clearAuth = () => {
    console.log('🚨 [HttpClient] clearAuth() - Clearing all auth data');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('🚨 [HttpClient] Redirecting to home page');
    window.location.href = '/';
  };

  public getInstance(): AxiosInstance {
    return this.client;
  }

  public setAuthToken(token: string) {
    console.log('🔐 [HttpClient] setAuthToken() - Saving access token:', token.substring(0, 20) + '...');
    localStorage.setItem('accessToken', token);
  }

  public setRefreshToken(token: string) {
    console.log('🔄 [HttpClient] setRefreshToken() - Saving refresh token');
    localStorage.setItem('refreshToken', token);
  }

  public clearTokens() {
    console.log('🗑️ [HttpClient] clearTokens() - Clearing tokens from localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // Proxy methods for Axios operations
  public get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config);
  }
}

export const httpClient = new HttpClient();
export default httpClient;
