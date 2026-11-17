require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db');

const app = express();

// Middleware
app.use(cors());          // allow the React app (another port) to call this API
app.use(express.json());  // parse JSON request bodies

// Routes
app.get('/', (req, res) => res.json({ message: 'Library API is running' }));
app.use('/auth', require('./routes/auth'));
app.use('/books', require('./routes/books'));
app.use('/transactions', require('./routes/transactions'));
app.use('/users', require('./routes/users'));

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

initDb()
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Could not connect to MySQL. Check your .env settings.\n', err.message);
    process.exit(1);
  });
