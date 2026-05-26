/**
 * GraphQL Query Builder Utility
 * Helper functions for building and executing GraphQL queries
 */

import httpClient from '@/lib/http-client';
import { apiConfig } from '@/config/api';

export interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}

export interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; extensions?: any }>;
}

/**
 * Execute a GraphQL query
 */
export const executeGraphQL = async <T = any>(request: GraphQLRequest): Promise<T> => {
  try {
    const response = await httpClient.post<GraphQLResponse<T>>(
      apiConfig.endpoints.graphql,
      request
    );

    if (response.data.errors && response.data.errors.length > 0) {
      const errorMessage = response.data.errors.map(e => e.message).join(', ');
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    return response.data.data as T;
  } catch (error) {
    console.error('GraphQL request failed:', error);
    throw error;
  }
};

/**
 * Build a query string (utility for type safety)
 */
export const buildQuery = (query: string) => query;

/**
 * Build a mutation string (utility for type safety)
 */
export const buildMutation = (mutation: string) => mutation;
