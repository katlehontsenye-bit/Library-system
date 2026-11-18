# Library Management System (BIWA2110 Lab Test)

## Login details
After running `npm run seed`, log in with:
- Membership ID: **ADMIN001**
- Password: **admin123**

A book-stock and borrowing app.

- **frontend/** - React (Vite), React Router, hooks, controlled forms, Fetch API
- **backend/** - Express REST API with PostgreSQL (`pg`), `express.json()` and `cors`

## Setup

### 1. Database (pgAdmin)
1. Create an empty database named `library_db` (right-click Databases -> Create -> Database).
2. Right-click `library_db` -> Query Tool, paste the contents of `backend/schema.sql`, and run it (F5).

### 2. Backend
```bash
cd backend
cp .env.example .env     # set DB_PASSWORD to PostgreSQL password
npm install
npm run seed             # creates admin: ADMIN001 / admin123
npm start                # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

Log in with **ADMIN001 / admin123**, then add members from User Management.

## API

| Method | Route | Purpose |
|---|---|---|
| GET/POST | `/books` | List / add book |
| GET/PUT/DELETE | `/books/:id` | One book |
| GET/POST | `/transactions` | History / add stock, borrow, return (updates stock) |
| GET/POST | `/users` | List / add user |
| PUT/DELETE | `/users/:id` | Update / delete user |
| POST | `/users/login` | Log in with membership ID + password |

## Features mapped to the brief

- **Book management:** add (title, author, genre, ISBN, quantity), update inline, delete
- **Availability:** stock tracked per book; transactions add stock, deduct on borrow, add back on return; borrowing never goes below zero
- **Users:** login form, add / update / delete (admin), passwords hashed with bcrypt
- **Dashboard:** availability cards, low stock (fewer than 2 copies) highlighted
- **Transactions page:** form plus full history log

## Notes

Login keeps the user in `localStorage` and the API has no token check; this is fine for a lab test but a real system would add JWT/session auth on the backend.
