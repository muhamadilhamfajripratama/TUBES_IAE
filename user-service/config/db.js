const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "host.docker.internal",
  user: "root",
  password: "",
  database: "user_db", // Arahkan ke user_db
});

pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL (user_db)"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = pool;