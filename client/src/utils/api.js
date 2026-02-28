const BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.defaults = {
      headers: {
        common: {}
      }
    };
  }

  async request(method, url, data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaults.headers.common
      }
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${url}`, config);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || 'Request failed');
    }

    return { data: responseData };
  }

  get(url) {
    return this.request('GET', url);
  }

  post(url, data) {
    return this.request('POST', url, data);
  }

  put(url, data) {
    return this.request('PUT', url, data);
  }

  delete(url) {
    return this.request('DELETE', url);
  }
}

export const api = new ApiClient();
