const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "host.docker.internal",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tubes_applicant_db",
});

const checkConnection = async (retries = 10, delay = 3000) => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL (Applicant Service)");
    connection.release();
  } catch (err) {
    if (retries > 0) {
      console.log(`⏳ Waiting for MySQL (Applicant Service) to be ready... (${retries} attempts left)`);
      setTimeout(() => checkConnection(retries - 1, delay), delay);
    } else {
      console.error("❌ Database connection failed after multiple attempts:", err);
    }
  }
};

checkConnection();

module.exports = pool;