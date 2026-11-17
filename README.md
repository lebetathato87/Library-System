# 📚 Pink Library – Library Management System
**Course:** Web Application Development – BIWA2110 (Lab Test)

A full-stack library system.

| Part | Technology |
|------|------------|
| `frontend/` | React 18 (JSX, hooks, React Router), Fetch API, plain CSS (pink theme) |
| `backend/`  | Express.js REST API, MySQL (`mysql2`), `express.json()` + `cors` middleware |

## Features
- **Books** – add, update, delete (Title, Author, Genre, ISBN, Initial Quantity)
- **Availability** – stock per book; transactions to **add stock**, **borrow** (deducts stock) and **return**
- **Users** – login, add / update / delete users (name, membership ID, role)
- **Dashboard** – cards or table view, search, and **low-stock highlight (fewer than 2 copies)**
- **Roles** – `admin` can manage books/users and add stock; `member` can view books, borrow/return and see their own history
- Fully **responsive** (tables turn into cards on phones)

## Quick start (Windows)
1. Make sure MySQL is running (XAMPP: click **Start** next to MySQL).
2. Double-click **`start.bat`**. The first time it asks for your MySQL root password (press Enter if you have none), then installs everything and opens the app.
3. Log in with `m251107` / `tsepang11`, or click **Create New Account**.

Wrong MySQL password? Double-click `reset-mysql-password.bat`, then `start.bat` again.

## How to run (manual)

### 1. Requirements
Node.js 18+ and a running MySQL server.

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # then edit DB_USER / DB_PASSWORD to match your MySQL
npm start                 # http://localhost:5000
```
On first start the server **creates the database, tables and a default admin automatically**. New visitors can also click **Create New Account** on the login page (these accounts are always normal members):

| Membership ID | Password |
|---------------|----------|
| `m251107`     | `tsepang11` |

(Optional) load sample books: `mysql -u root -p < sample_data.sql`

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env      # only needed if your API is not on http://localhost:5000
npm run dev               # http://localhost:5173
```
Open http://localhost:5173 and log in.

## REST API
All routes except `/auth/login` and `/auth/register` need the header `Authorization: Bearer <token>`.

| Method | Route | Who | Purpose |
|--------|-------|-----|---------|
| POST | `/auth/register` | public | Create a member account |
| POST | `/auth/login` | public | Log in, returns token + user |
| GET | `/auth/me` | any | Current user |
| GET | `/books`, `/books/:id` | any | List / view books |
| POST | `/books` | admin | Add book |
| PUT | `/books/:id` | admin | Update book |
| DELETE | `/books/:id` | admin | Delete book |
| GET | `/transactions`, `/transactions/:id` | any (members see own) | History |
| POST | `/transactions` | any (`ADD_STOCK` admin only) | Add stock / borrow / return |
| PUT | `/transactions/:id` | admin | Edit note |
| DELETE | `/transactions/:id` | admin | Remove log entry (stock unchanged) |
| GET/POST/PUT/DELETE | `/users`, `/users/:id` | admin | Manage users |

## Database tables
`users`, `books`, `transactions` (see `backend/schema.sql`). Borrowing runs inside a
SQL transaction with a row lock, so stock can never go below zero.

## Project structure
```
backend/   server.js, db.js, routes/, middleware/, utils/, schema.sql
frontend/  src/ (pages/, components/, context/, api.js, index.css)
```

## Note on passwords
Passwords are never stored in plain text – they are salted and hashed with scrypt.
