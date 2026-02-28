const BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.defaults = {
      headers: {
        common: {}
      }
    };
  }

  async request(method, url, data = null, options = {}) {
    const isFormData = data instanceof FormData;

    const config = {
      method,
      headers: {
        ...this.defaults.headers.common
      }
    };

    // Don't set Content-Type for FormData - browser will set it with boundary
    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (data) {
      config.body = isFormData ? data : JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(responseData.error || 'Request failed');
      error.response = { data: responseData };
      throw error;
    }

    return { data: responseData };
  }

  get(url) {
    return this.request('GET', url);
  }

  post(url, data, options) {
    return this.request('POST', url, data, options);
  }

  put(url, data) {
    return this.request('PUT', url, data);
  }

  delete(url) {
    return this.request('DELETE', url);
  }
}

export const api = new ApiClient();
