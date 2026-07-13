import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 8000
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") ?? sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("parking-bms-auth");
      sessionStorage.removeItem("parking-bms-auth");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

