import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request interceptor: Attach Bearer token if present, bootstrap dev token if in dev bypass mode
api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('ba_access_token');
  if (
    !token &&
    import.meta.env.DEV &&
    import.meta.env.VITE_AUTH_BYPASS !== 'false' &&
    !config.url?.includes('/auth/')
  ) {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email: 'founder@odyssey.local', password: 'Password123!' },
        { withCredentials: true }
      );
      if (data?.data?.accessToken) {
        token = data.data.accessToken;
        localStorage.setItem('ba_access_token', token);
      }
    } catch {
      // Backend may be offline, proceed so standard error handling takes over
    }
  }
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: Handle 401 by attempting token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes('/auth/')
    ) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
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
