# Fahasa Backend (Requirement 1d)

## Stack
- Node.js + Express
- MongoDB (Mongoose)
- JWT + bcrypt
- OAuth Google (Passport.js, optional via env)

## Main API groups
- `/api/auth/*`
- `/api/products/*`
- `/api/categories/*`
- `/api/cart/*`
- `/api/orders/*`
- `/api/reviews/*`
- `/api/user/*`
- `/api/admin/*`

## Local run without Docker
1. Copy `.env.example` to `.env`
2. Install packages: `npm install`
3. Run API: `npm run dev`

## Run with Docker Compose (from repository root)
- `docker compose up --build`

After startup:
- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Health check: http://localhost:8080/api/health

## Tài khoản admin mẫu (sau khi chạy seed)

Chạy seed: `npm run seed` (trong thư mục `backend`, cần MongoDB và file `.env` hợp lệ).

| Email | Mật khẩu   |
|-------|------------|
| `admin@fahasa.com` | `Admin@123` |

**Lưu ý:** toàn bộ `GET/POST/PUT/DELETE` dưới `/api/admin/*` yêu cầu JWT hợp lệ **và** `role: "admin"`. Tài khoản khách (`customer`) sẽ nhận 403. Hướng dẫn thao tác trên giao diện xem [README ở thư mục gốc dự án](../README.md#hướng-dẫn-admin).
