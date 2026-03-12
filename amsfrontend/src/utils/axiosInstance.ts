import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// ✅ Create the axios instance
const instance: AxiosInstance = axios.create({
  // baseURL: "http://localhost:5000/api",
  baseURL: "https://www.ampt.online/api"
  withCredentials: false, // ⭐ important if backend uses cookies
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach token interceptor
instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");
  console.log("Attaching token to request:", token); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
// ⭐ NEW: Handle 401 errors globally
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid or expired → clean logout
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);


export default instance;
