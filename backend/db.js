const mysql = require('mysql2/promise');
const { hashPassword } = require('./utils/password');

const DB_NAME = process.env.DB_NAME || 'library_db';
const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

// Default administrator account
const ADMIN = { name: 'Administrator', membership_id: 'm251107', password: 'tsepang11' };

let pool;

/** Create the database, tables and default admin account if they do not exist yet. */
async function initDb() {
  const conn = await mysql.createConnection(baseConfig);
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
  await conn.end();

  pool = mysql.createPool({
    ...baseConfig,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      name          VARCHAR(100) NOT NULL,
      membership_id VARCHAR(30)  NOT NULL UNIQUE,
      role          ENUM('admin','member') NOT NULL DEFAULT 'member',
      password_hash VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      title      VARCHAR(200) NOT NULL,
      author     VARCHAR(150) NOT NULL,
      genre      VARCHAR(80)  NOT NULL,
      isbn       VARCHAR(20)  NOT NULL UNIQUE,
      quantity   INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      book_id    INT NOT NULL,
      user_id    INT NULL,
      type       ENUM('ADD_STOCK','BORROW','RETURN') NOT NULL,
      quantity   INT NOT NULL,
      note       VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`);

  // Make sure the default admin account exists
  const [existing] = await pool.query('SELECT id FROM users WHERE membership_id = ?', [ADMIN.membership_id]);
  if (existing.length === 0) {
    await pool.query(
      `INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, 'admin', ?)`,
      [ADMIN.name, ADMIN.membership_id, hashPassword(ADMIN.password)]
    );
    console.log(`Default admin created -> membership ID: ${ADMIN.membership_id}`);
  }
}

module.exports = {
  initDb,
  query: (sql, params) => pool.query(sql, params),
  getConnection: () => pool.getConnection(),
};
