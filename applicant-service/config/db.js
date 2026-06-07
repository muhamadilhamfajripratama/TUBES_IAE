const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "host.docker.internal",
  user: "root",
  password: "",
  database: "applicant_db", // Arahkan ke applicant_db
});

pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL (applicant_db)"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = pool;