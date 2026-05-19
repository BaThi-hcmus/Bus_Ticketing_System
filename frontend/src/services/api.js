import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Gọi sang cổng 3001 của Backend mới
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor nếu cần bắt lỗi chung
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export default api;
