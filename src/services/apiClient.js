/**
 * Zenelait AI CRM — Centralized Typed API Client
 * Connects to Spring Boot REST API at http://localhost:8080/api/v1
 * Handles 401, 403, 404, 409, 422, 500 error envelopes and pagination
 */

const API_HOST = import.meta.env.VITE_API_URL || 'https://trustworthy-liberation-production-90f6.up.railway.app';
const API_V1_BASE = `${API_HOST}/api/v1`;

class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  constructor(baseUrl = API_V1_BASE) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem('zenelait_jwt_token') || null;
  }

  getTenantId() {
    return localStorage.getItem('zenelait_active_tenant_id') || 'TEN-IT-001';
  }

  getTenantIndustry() {
    return localStorage.getItem('zenelait_active_tenant_industry') || 'SOFTWARE_IT';
  }

  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Tenant-Id': this.getTenantId(),
      'X-Tenant-Industry': this.getTenantIndustry(),
      ...customHeaders
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers)
    };

    try {
      const res = await fetch(url, config);
      const data = await res.json().catch(() => null);

      if (res.ok) {
        return {
          success: true,
          status: res.status,
          data: data?.data !== undefined ? data.data : data,
          meta: data?.meta || null,
          message: data?.message || null
        };
      }

      // Handle HTTP Error Envelopes
      let errorMessage = 'An unexpected error occurred.';
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
      } else if (res.status === 401) {
        errorMessage = 'Unauthorized: Invalid or expired session credentials.';
      } else if (res.status === 403) {
        errorMessage = 'Forbidden: You do not have permission to perform this action.';
      } else if (res.status === 404) {
        errorMessage = 'Requested resource not found.';
      } else if (res.status === 409) {
        errorMessage = 'Conflict: Record with this identifier already exists.';
      } else if (res.status === 422) {
        errorMessage = 'Validation Error: Please check form field requirements.';
      } else if (res.status === 500) {
        errorMessage = 'Internal Server Error: Backend service encountered an issue.';
      }

      return {
        success: false,
        status: res.status,
        error: errorMessage,
        details: data?.details || data?.errors || null
      };
    } catch (err) {
      return {
        success: false,
        status: 0,
        isOffline: true,
        error: err.message || 'Cannot connect to backend service at http://localhost:8080'
      };
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v);
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export { ApiClient, ApiError };
