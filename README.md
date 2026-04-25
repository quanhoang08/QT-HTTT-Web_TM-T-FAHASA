# QT-HTTT-Web_TM-T-FAHASA

Dự án thương mại điện tử sách (Fahasa) — gồm frontend (Vite + React) và backend (Node.js + Express + MongoDB).

Sau khi chạy stack (tự cài hoặc `docker compose up` từ thư mục gốc):

- **Frontend:** http://localhost:5173  
- **API:** thường http://localhost:8080 (xem `VITE_API_URL` / `docker-compose.yml`)

---

## Hướng dẫn Admin

### Quyền truy cập

Các API dưới namespace **`/api/admin/*`** (dashboard, sản phẩm, đơn hàng, khách hàng…) **chỉ** chấp nhận tài khoản có `role: "admin"` trên cơ sở dữ liệu. Tài khoản **đăng ký/đăng nhập thường** có mặc định `role: "customer"`; nếu dùng token của khách mà gọi API admin, server sẽ trả **403 Forbidden** — đây là hành vi đúng thiết kế.

### Tạo tài khoản admin bằng seed

Trong thư mục `backend`, cấu hình file `.env` (MongoDB, `JWT_SECRET`, v.v.) rồi chạy:

```bash
cd backend
npm install
npm run seed
```

Seed sẽ tạo (cùng dữ liệu mẫu) user admin mặc định nếu chưa tồn tại.

### Thông tin đăng nhập admin mẫu

| Trường   | Giá trị mặc định  |
|----------|-------------------|
| **Email**    | `admin@fahasa.com` |
| **Mật khẩu** | `Admin@123`        |

*Trên môi trường production, nên đổi mật khẩu / tắt tài khoản mẫu khi triển khai thật.*

### Vào trang quản trị trên giao diện

1. Mở frontend (ví dụ http://localhost:5173).  
2. **Đăng xuất** nếu đang dùng tài khoản khách.  
3. **Đăng nhập** bằng `admin@fahasa.com` / `Admin@123`.  
4. Trên header, mục **Admin** sẽ tương ứng quyền quản trị; nhấn để mở bảng điều khiển admin (dashboard, sản phẩm, đơn hàng, khách hàng…).

Nếu đăng nhập bằng tài khoản không phải admin, ứng dụng sẽ không tải được dữ liệu khu vực admin (hoặc hiển thị thông báo không đủ quyền).

### Tài liệu chi tiết từng phần

- Backend (API, Docker, biến môi trường): xem [backend/README.md](backend/README.md)  
- Frontend (chạy dev): xem [Fahasa_Figma_FRONT_END/README.md](Fahasa_Figma_FRONT_END/README.md)
