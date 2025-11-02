const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const sendRequest = async (endpoint, method = 'GET', body = null, requireAuth = true) => {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (requireAuth && token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(errorData.error || errorData.detail || 'Request failed');
    }

    const data = await response.json().catch(() => null);
    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const getRequest = (endpoint, requireAuth = true) =>
  sendRequest(endpoint, 'GET', null, requireAuth);

export const postRequest = (endpoint, body, requireAuth = true) =>
  sendRequest(endpoint, 'POST', body, requireAuth);

export const putRequest = (endpoint, body, requireAuth = true) =>
  sendRequest(endpoint, 'PUT', body, requireAuth);

export const patchRequest = (endpoint, body, requireAuth = true) =>
  sendRequest(endpoint, 'PATCH', body, requireAuth);

export const deleteRequest = (endpoint, requireAuth = true) =>
  sendRequest(endpoint, 'DELETE', null, requireAuth);

