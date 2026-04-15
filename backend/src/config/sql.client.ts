import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.RDB_HOST,
  user: process.env.RDB_USER,
  password: process.env.RDB_PASSWORD,
  database: process.env.RDB_NAME,
  port: Number(process.env.RDB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
})
