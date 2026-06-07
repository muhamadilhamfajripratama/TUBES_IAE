const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "host.docker.internal",
  user: "root",
  password: "",
  database: "vacancy_db", // Arahkan ke vacancy_db
});

pool.getConnection()
  .then(() => console.log("✅ Connected to MySQL (vacancy_db)"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = pool;