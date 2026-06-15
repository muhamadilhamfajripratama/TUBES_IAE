CREATE DATABASE IF NOT EXISTS tubes_applicant_db;
USE tubes_applicant_db;

CREATE TABLE IF NOT EXISTS applicants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vacancy_id INT NOT NULL,
  cv VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'Applied',
  administrasi_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
