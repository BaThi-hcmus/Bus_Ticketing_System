# 1. Tải môi trường Node.js phiên bản 20 siêu nhẹ
FROM node:20-alpine

# 2. Tạo một thư mục tên là /app BÊN TRONG container để làm việc
WORKDIR /app

# 3. Copy các file quản lý thư viện từ máy thật vào container trước
COPY package*.json ./

# 4. Chạy lệnh cài đặt các thư viện (node_modules) bên trong container
RUN npm install

# 5. Copy toàn bộ mã nguồn còn lại từ máy thật vào container
COPY . .

# 6. Báo cho Docker biết ứng dụng này sẽ chạy ở cổng 3001
EXPOSE 3001

# 7. Lệnh kích hoạt ứng dụng chạy ở chế độ Development (Start:dev)
CMD ["npm", "run", "start:dev"]