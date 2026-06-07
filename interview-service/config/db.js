const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "host.docker.internal",
  user: "root",
  password: "",
  database: "interview_db", // Arahkan ke interview_db
});

pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL (interview_db)"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = pool;