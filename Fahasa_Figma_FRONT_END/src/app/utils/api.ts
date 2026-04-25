import axios from "axios";

// Đọc API URL từ môi trường (nếu có, hoặc dùng default locahost:8080)
export const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor gắn Token tự động
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("fahasa_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor xử lý lỗi chung (chẳng hạn token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Bị unauthorized => Xóa token và có thể đẩy về trang chủ hoặc hiện popup
      localStorage.removeItem("fahasa_token");
      // window.location.href = "/"; // Tuỳ chọn
    }
    return Promise.reject(error);
  }
);

export default api;
