/**
 * API Configuration Utility
 * 
 * Provides centralized configuration for API URLs that can adapt to different environments:
 * - Development (localhost)
 * - Production (real server IP or domain)
 */

class ApiConfig {
  private static instance: ApiConfig;
  private apiBaseUrl: string;
  private serverBaseUrl: string;

  private constructor() {
    // Initialize with environment variables or defaults
    this.apiBaseUrl = this.determineApiBaseUrl();
    this.serverBaseUrl = this.determineServerBaseUrl();
  }

  public static getInstance(): ApiConfig {
    if (!ApiConfig.instance) {
      ApiConfig.instance = new ApiConfig();
    }
    return ApiConfig.instance;
  }

  /**
   * Determines the API base URL based on environment variables or current location
   */
  private determineApiBaseUrl(): string {
    // First priority: Environment variable
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }

    // Second priority: Check if using production backend
    if (import.meta.env.VITE_BACKEND_ENV_PRODUCTION === 'true') {
      return 'http://10.102.234.158:8000/api';
    }

    // Third priority: Detect if we're on the real server
    const hostname = window.location.hostname;
    if (hostname === '10.102.234.158' || hostname.includes('your-domain.com')) {
      return `http://${hostname}:8000/api`;
    }

    // Default fallback for development
    return 'http://localhost:8000/api';
  }

  /**
   * Determines the server base URL (without /api) for file URLs
   */
  private determineServerBaseUrl(): string {
    // First priority: Environment variable
    if (import.meta.env.VITE_SERVER_URL) {
      return import.meta.env.VITE_SERVER_URL;
    }
    
    // Second: try to derive from API URL by removing /api
    const apiUrl = this.apiBaseUrl;
    if (apiUrl.endsWith('/api')) {
      return apiUrl.substring(0, apiUrl.length - 4);
    }

    // Third priority: Detect if we're on the real server
    const hostname = window.location.hostname;
    if (hostname === '10.102.234.158' || hostname.includes('your-domain.com')) {
      return `http://${hostname}:8000`;
    }

    // Default fallback
    return 'http://localhost:8000';
  }

  /**
   * Returns the base URL for API calls
   */
  public getApiUrl(): string {
    return this.apiBaseUrl;
  }

  /**
   * Returns the base URL for server (used for file URLs)
   */
  public getServerUrl(): string {
    return this.serverBaseUrl;
  }

  /**
   * Builds a complete API endpoint URL
   */
  public buildApiUrl(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    return `${this.apiBaseUrl}/${cleanEndpoint}`;
  }
}

// Export singleton methods for easy use
export const getApiUrl = (): string => ApiConfig.getInstance().getApiUrl();
export const getServerUrl = (): string => ApiConfig.getInstance().getServerUrl();
export const buildApiUrl = (endpoint: string): string => ApiConfig.getInstance().buildApiUrl(endpoint);

export default ApiConfig.getInstance();