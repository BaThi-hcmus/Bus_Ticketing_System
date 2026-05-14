# Cấu trúc thư mục
## backend 
backend/
├── src/
│   ├── common/             # Các thành phần dùng chung cho toàn hệ thống
│   │   ├── decorators/     # Ví dụ: @GetUser(), @Roles()
│   │   ├── filters/        # Exception Filters (Xử lý lỗi tập trung)
│   │   ├── guards/         # AuthGuard, RolesGuard (Phân quyền Admin/User)
│   │   ├── interceptors/   # TransformInterceptor (Chuẩn hóa đầu ra API)
│   │   └── middleware/     # Logging, Compression
│   ├── config/             # Cấu hình TypeORM kết nối SQL Server, JWT
│   ├── modules/            # Chia theo nghiệp vụ (Feature Modules)
│   │   ├── auth/           # Login, Register, Refresh Token
│   │   ├── buses/          # CRUD xe khách
│   │   ├── routes/         # Quản lý tuyến đường
│   │   ├── trips/          # Quản lý chuyến xe cụ thể
│   │   ├── seats/          # Quản lý trạng thái ghế (Available/Occupied)
│   │   └── bookings/       # Xử lý đặt vé (Transaction, BookingDetails)
│   ├── app.module.ts       # Module gốc, nơi import các Feature Modules
│   └── main.ts             # Khởi tạo ứng dụng
└── .env                    # Lưu DB_HOST, DB_USER, DB_PASS, JWT_SECRET

## Frontend 
frontend/
├── src/
│   ├── assets/             # Hình ảnh, Fonts, Global CSS
│   ├── common/             # UI Components dùng chung (Button, Modal, Input)
│   ├── hooks/              # Custom hooks (useAuth, useFetch)
│   ├── modules/            # Chia theo tính năng (Feature-based)
│   │   ├── auth/           # Login/Register Module
│   │   │   ├── components/ # LoginForm, RegisterForm
│   │   │   ├── pages/      # LoginPage.tsx, RegisterPage.tsx
│   │   │   └── services/   # auth.api.ts (Axios calls)
│   │   ├── trips/          # Tìm kiếm chuyến xe
│   │   │   ├── components/ # TripCard, SearchBar
│   │   │   ├── pages/      # TripListPage.tsx
│   │   │   └── services/   # trip.api.ts
│   │   └── booking/        # Đặt vé & Thanh toán
│   │       ├── components/ # SeatGrid, BookingSummary
│   │       ├── pages/      # CheckoutPage.tsx
│   │       └── services/   # booking.api.ts
│   ├── routes/             # Cấu hình React Router (AppRoutes.tsx)
│   ├── store/              # Quản lý State toàn cục (Zustand hoặc Redux)
│   └── utils/              # Helpers (formatDate, formatCurrency)