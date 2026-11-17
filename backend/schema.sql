-- Library Management System schema (PostgreSQL)
-- 1. In pgAdmin, create an empty database called  library_db
-- 2. Open a Query Tool ON library_db and run this whole file.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(30)  NOT NULL UNIQUE,
  role          VARCHAR(10)  NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS books (
  id         SERIAL PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(150) NOT NULL,
  genre      VARCHAR(80)  NOT NULL,
  isbn       VARCHAR(20)  NOT NULL UNIQUE,
  quantity   INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Every stock movement is recorded here: this is the borrowing / stock history.
CREATE TABLE IF NOT EXISTS transactions (
  id         SERIAL PRIMARY KEY,
  book_id    INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id    INT NULL REFERENCES users(id) ON DELETE SET NULL,
  type       VARCHAR(10) NOT NULL CHECK (type IN ('ADD_STOCK', 'BORROW', 'RETURN')),
  quantity   INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sample books (the default admin user is created by `npm run seed`)
INSERT INTO books (title, author, genre, isbn, quantity) VALUES
  ('Clean Code', 'Robert C. Martin', 'Programming', '9780132350884', 5),
  ('The Pragmatic Programmer', 'Andrew Hunt', 'Programming', '9780135957059', 1),
  ('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 3),
  ('Sapiens', 'Yuval Noah Harari', 'History', '9780062316097', 0)
ON CONFLICT (isbn) DO NOTHING;
