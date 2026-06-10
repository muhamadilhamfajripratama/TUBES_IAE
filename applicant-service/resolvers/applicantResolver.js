const db = require('../config/db');

const applicantResolvers = {
  Query: {

    getApplicants: async () => {
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
      `);
      return rows;
    },

    getApplicantById: async (_, { id }) => {
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.id = ?
      `,[id]);
      return rows[0];
    },

    getApplicantsByUser: async (_, { user_id }) => {
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.user_id = ?
      `,[user_id]);
      return rows;
    },

    getApplicantsByStatus: async (_, { status }) => {
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.status = ?
      `,[status]);
      return rows;
    }

  },

  Mutation: {
    applyJob: async (_, { user_id, vacancy_id, cv }) => {
      const query = `INSERT INTO applicants(user_id, vacancy_id, cv, status, administrasi_status) VALUES (?, ?, ?, 'Applied', 'Pending')`;
      const [result] = await db.query(query,[user_id, vacancy_id, cv || null]);
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.id = ?
      `,[result.insertId]);
      return rows[0];
    },

    updateApplicantStatus: async (_, { id, status }) => {
      await db.query("UPDATE applicants SET status = ? WHERE id = ?",[status, id]);
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.id = ?
      `,[id]);
      return rows[0];
    },

    updateAdministrasiStatus: async (_, { id, status }) => {
      await db.query("UPDATE applicants SET administrasi_status = ? WHERE id = ?",[status, id]);
      const [rows] = await db.query(`
        SELECT a.*, u.name AS user_name, v.title AS vacancy_title 
        FROM applicants a 
        LEFT JOIN user_db.users u ON a.user_id = u.id 
        LEFT JOIN vacancy_db.vacancies v ON a.vacancy_id = v.id
        WHERE a.id = ?
      `,[id]);
      return rows[0];
    },

    deleteApplicant: async (_, { id }) => {
      await db.query("DELETE FROM applicants WHERE id = ?",[id]);
      return "Applicant deleted successfully";
    }

  }
};

module.exports = applicantResolvers;