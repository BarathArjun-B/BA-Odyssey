import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5005/api/v1',
  withCredentials: true,
});

// Request interceptor: Attach Bearer token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ba_access_token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Handle 401 by attempting token refresh on port 5005
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          'http://localhost:5005/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );
        if (data?.data?.accessToken) {
          localStorage.setItem('ba_access_token', data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }
        return api(originalRequest);
      } catch (err) {
        // Refresh token failed, force logout
        localStorage.removeItem('ba_access_token');
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
