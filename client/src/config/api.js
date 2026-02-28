// API Configuration
// When accessing remotely via tunnel, use the tunnel URL
// When local, use relative /api path

const TUNNEL_API_URL = 'https://tradesync-api-nick.loca.lt';

// Detect if we're accessing from localhost or remotely
const isLocalhost = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168.'));

export const API_BASE_URL = isLocalhost ? '/api' : TUNNEL_API_URL + '/api';

export async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {};
  const token = localStorage.getItem('token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  return response;
}
