const express = require('express');
const cors = require('cors');
require('dotenv').config();

const booksRouter = require('./routes/books');
const transactionsRouter = require('./routes/transactions');
const usersRouter = require('./routes/users');

const app = express();

// Middleware
app.use(cors());          // allow the React dev server to call this API
app.use(express.json());  // parse JSON request bodies

// Routes
app.use('/books', booksRouter);
app.use('/transactions', transactionsRouter);
app.use('/users', usersRouter);

app.get('/', (req, res) => res.json({ message: 'Library API is running' }));

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
