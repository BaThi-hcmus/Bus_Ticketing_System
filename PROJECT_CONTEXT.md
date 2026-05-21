# Bối cảnh & Cấu trúc dự án Bus_Ticketing_System

Chào AI Assistant, dưới đây là thông tin chi tiết và ngữ cảnh của dự án **Bus_Ticketing_System** để bạn có thể hiểu và làm việc ngay lập tức. Hãy đọc kỹ trước khi thực hiện các yêu cầu lập trình tiếp theo.

---

## 1. Tổng quan & Nghiệp vụ (Project Overview)
Dự án là một hệ thống **Quản lý & Đặt vé xe khách trực tuyến (Bus Ticketing System)**, chia làm 2 phân hệ chính:
- **Phân hệ Admin (Quản trị viên / Nhân viên):** CRUD thông tin xe khách (Buses), tuyến đường (Routes) với danh sách trạm dừng dừng chân trung gian (Route Stations), quản lý lịch trình chuyến xe cụ thể (Trips), quản lý người dùng (Users), và danh sách đặt vé (Bookings).
- **Phân hệ Client (Khách hàng - Đang phát triển):** Tìm kiếm chuyến xe theo điểm đi/đến, đặt vé, chọn ghế trống, thanh toán.

---

## 2. Kiến trúc & Công nghệ (Tech Stack)
Dự án được cấu trúc theo dạng Monorepo đơn giản gồm 2 thư mục độc lập ở root:
```text
Bus_Ticketing_System/
├── backend/      # NestJS Application (API Server)
└── frontend/     # React Application (Vite/SPA)
```

### Backend (API Server)
- **Framework:** NestJS (TypeScript).
- **Database ORM:** TypeORM kết nối với **Microsoft SQL Server (MSSQL)**.
- **Port chạy local:** `http://localhost:3001` (Cấu hình qua file `.env` tại `backend/.env`).
- **Thư viện chính:** `@nestjs/typeorm`, `typeorm`, `mssql`, `@nestjs/config`.

### Frontend (Client App)
- **Framework:** React SPA (Vite).
- **Styling:** Vanilla CSS kết hợp **CSS Modules** (`*.module.css`).
- **Routing:** `react-router-dom` (định tuyến `/admin/buses`, `/admin/routes`).
- **HTTP Client:** Axios (cấu hình base URL tới cổng `3001` của backend tại `frontend/src/services/api.js`).

---

## 3. Cấu trúc Database (TypeORM Entities)
Cơ sở dữ liệu gồm 9 bảng chính có mối quan hệ ràng buộc chặt chẽ với nhau:

1. **User (Users):** Quản lý tài khoản.
   - Các cột: `id`, `email` (unique), `password`, `fullName`, `phoneNumber` (unique), `role` (`'admin' | 'staff' | 'client'`), `isActive`, `createdAt`.
   - Quan hệ: `OneToMany` với `Booking`.
2. **Station (Stations):** Danh sách các bến xe / trạm dừng.
   - Các cột: `id`, `name`, `address`, `deleted` (boolean, hỗ trợ soft delete), `createdAt`.
   - Quan hệ: `OneToMany` với `RouteStation`.
3. **Route (Routes):** Tuyến đường chính nối điểm đi và điểm đến.
   - Các cột: `id`, `departureLocation`, `destinationLocation`, `distanceKm`, `estimatedDuration`, `status` (`'active' | 'inactive'`), `deleted`, `createdAt`.
   - Quan hệ: `OneToMany` với `Trip`, `OneToMany` với `RouteStation` (cascade).
4. **RouteStation (Route_Stations):** Bảng trung gian xác định các trạm dừng của tuyến đường theo thứ tự.
   - Các cột: `id`, `routeId` (khóa ngoại), `stationId` (khóa ngoại), `stopOrder` (thứ tự trạm từ 1..N), `distanceFromStart` (khoảng cách từ trạm xuất phát).
   - Quan hệ: `ManyToOne` với `Route`, `ManyToOne` với `Station`.
5. **Bus (Buses):** Quản lý đội xe.
   - Các cột: `id`, `licensePlate` (biển số xe, unique), `type` (loại xe), `totalSeats` (tổng số ghế), `model` (hãng/dòng xe), `status` (`'active' | 'inactive'`), `deleted`, `createdAt`.
   - Quan hệ: `OneToMany` với `Trip`.
6. **Trip (Trips):** Chuyến đi thực tế được lên lịch của một xe bus trên một tuyến đường cụ thể.
   - Các cột: `id`, `routeId` (khóa ngoại), `busId` (khóa ngoại), `departureTime`, `arrivalTime`, `ticketPrice`, `status` (`'scheduled' | ...`).
   - Quan hệ: `ManyToOne` với `Route`, `ManyToOne` với `Bus`, `OneToMany` với `Seat`, `OneToMany` với `Booking`.
7. **Seat (Seats):** Các ghế trên từng chuyến xe cụ thể (tránh trùng lặp khi đặt vé).
   - Các cột: `id`, `trip_id` (khóa ngoại), `seatNumber` (số thứ tự ghế), `isAvailable` (boolean).
   - Quan hệ: `ManyToOne` với `Trip`, `OneToOne` với `BookingDetail`.
8. **Booking (Bookings):** Thông tin hóa đơn đặt vé.
   - Các cột: `id`, `userId` (khóa ngoại), `tripId` (khóa ngoại), `bookingDate`, `totalAmount`, `paymentStatus`.
   - Quan hệ: `ManyToOne` với `User`, `ManyToOne` với `Trip`, `OneToMany` với `BookingDetail`.
9. **BookingDetail (BookingDetails):** Chi tiết ghế được đặt trong hóa đơn.
   - Các cột: `id`, `booking_id` (khóa ngoại), `seat_id` (khóa ngoại).
   - Quan hệ: `ManyToOne` với `Booking`, `OneToOne` với `Seat`.

---

## 4. Các tính năng hiện tại đã hoàn thành
Hiện tại dự án đã xây dựng xong giao diện quản trị Admin cơ bản với các chức năng sau:
- **Quản lý Xe Bus (`BusModule`):**
  - Xem danh sách xe bus phân trang, tìm kiếm theo từ khóa (Biển số xe, Loại xe, Hãng xe), lọc trạng thái hoạt động, sắp xếp động.
  - Thêm mới xe bus (Kiểm tra trùng lặp `licensePlate` không hoạt động/hoạt động).
  - Cập nhật thông tin xe bus và thực hiện xóa mềm (Cập nhật cột `deleted = true`).
  - Xem chi tiết xe bus đi kèm các chuyến xe liên quan.
- **Quản lý Tuyến đường (`RouteModule`):**
  - Xem danh sách tuyến đường kèm tổng số trạm trung gian của tuyến đó.
  - Thêm mới tuyến đường và phân bổ danh sách các trạm dừng dừng chân (`RouteStation`) theo thứ tự tăng dần.
  - Cơ chế kiểm tra trùng lặp tuyến đường thông minh: Nếu điểm đi, điểm đến và toàn bộ thứ tự trạm dừng giống hệt một tuyến đường đang hoạt động thì hệ thống sẽ từ chối tạo/sửa đổi.
  - Cập nhật tuyến đường: Cho phép cập nhật điểm đi/đến, khoảng cách, thời gian và thay thế/sắp xếp lại danh sách trạm dừng.
  - Xem chi tiết tuyến đường bao gồm danh sách trạm dừng đã sắp xếp thứ tự (`stopOrder`) tăng dần.
- **Quản lý Trạm xe (`StationModule`):**
  - Tự động seed dữ liệu mẫu gồm các bến xe lớn ở Việt Nam khi khởi động backend nếu bảng `Stations` trống.
  - Cung cấp API lấy toàn bộ trạm để phục vụ việc chọn trạm khi tạo/sửa tuyến đường.
- **Hệ thống Helper/Utility ở Backend:**
  - `Pagination`: Hỗ trợ tính toán phân trang động.
  - `Search`: Tìm kiếm tương đối (`ILike`) trên các trường được chỉ định.
  - `Sort`: Cấu hình sắp xếp linh hoạt gửi từ frontend.
  - `FilterStatus`: Lọc theo các trường trạng thái.

---

## 5. Định hướng phát triển tiếp theo
- **Backend:** 
  - Hoàn thiện chức năng quản lý chuyến xe (`Trips`) cho Admin bao gồm tạo chuyến xe tự động tạo các ghế trống tương ứng trong bảng `Seats`.
  - Hoàn thiện chức năng Đặt vé (`Bookings`) xử lý transaction đảm bảo tính nhất quán của dữ liệu ghế trống.
  - Xây dựng module Authenticate (đăng ký, đăng nhập, bảo mật JWT, phân quyền Admin/Client bằng Guard).
- **Frontend:**
  - Phát triển giao diện Quản lý Khách hàng, Quản lý Vé cho Admin.
  - Phát triển giao diện phía người dùng tìm chuyến đi và đặt vé trực quan.
