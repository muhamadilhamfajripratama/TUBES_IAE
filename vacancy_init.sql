CREATE DATABASE IF NOT EXISTS tubes_vacancy_db;
USE tubes_vacancy_db;

CREATE TABLE IF NOT EXISTS vacancies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Open',
  start_apply DATE,
  end_apply DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
