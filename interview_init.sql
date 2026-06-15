CREATE DATABASE IF NOT EXISTS tubes_interview_db;
USE tubes_interview_db;

CREATE TABLE IF NOT EXISTS interviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  applicant_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  interviewer VARCHAR(255) NOT NULL,
  result VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
