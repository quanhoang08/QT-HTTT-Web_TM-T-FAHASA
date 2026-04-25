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

## Demo admin account (seeded)
- Email: `admin@fahasa.com`
- Password: `Admin@123`
