# ShopEase - Online Shopping System

A full-stack e-commerce web application built as a semester project.

## Live Demo
- Frontend: https://shopeaseproject.vercel.app
- Backend API: https://backend-amber-theta-48.vercel.app

## Tech Stack
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT (JSON Web Tokens)
- Password Security: bcryptjs

## Features
- User registration and login
- Browse and search products
- Filter by category
- Shopping cart (localStorage)
- Place orders
- Order history
- Admin dashboard
- Product management (CRUD)
- Order status management
- Responsive design (mobile + desktop)

## Security
- Passwords hashed with bcrypt
- JWT authentication
- Protected API routes
- Input validation
- CORS protection

## Local Setup

### 1) Clone the repo
```bash
git clone https://github.com/yourusername/shopease.git
cd shopease
```

### 2) Backend setup
```bash
cd backend
npm install
```

### 3) Create `.env` file
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=shopease_db
JWT_SECRET=mysecretkey123
```

### 4) Setup database
Run the SQL in `database/schema.sql` in MySQL Workbench.

### 5) Start backend
```bash
npm run dev
```

### 6) Open frontend
Open `frontend/index.html` with Live Server.

## Test Accounts
- Admin: `admin@shopease.com` / `secret`
- Customer: Register a new account

## Project Structure
```text
shopease/
|-- frontend/          # HTML, CSS, JS files
|   |-- css/
|   |-- js/
|   |-- admin/         # Admin panel
|   `-- *.html
|-- backend/           # Node.js server
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- routes/
|   `-- server.js
`-- README.md
```
