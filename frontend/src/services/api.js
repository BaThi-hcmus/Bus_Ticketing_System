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
    const data = error.response?.data;
    console.error('API Error:', data || error.message);
    if (data?.message) {
      const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return Promise.reject({ ...data, message: msg });
    }
    return Promise.reject(data || error.message);
  }
);

export default api;
