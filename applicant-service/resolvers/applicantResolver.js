const db = require('../config/db');

const applicantResolvers = {
  Query: {

    getApplicants: async () => {
      const [rows] = await db.query("SELECT * FROM applicants");
      return rows;
    },

    getApplicantById: async (_, { id }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?",[id]);
      return rows[0];
    },

    getApplicantsByUser: async (_, { user_id }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE user_id = ?",[user_id]);
      return rows;
    },

    getApplicantsByStatus: async (_, { status }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE status = ?",[status]);
      return rows;
    }

  },

  Mutation: {
    applyJob: async (_, { user_id, vacancy_id }) => {
      const query = `INSERT INTO applicants(user_id, vacancy_id, status)VALUES (?, ?, 'Applied')`;
      const [result] = await db.query(query,[user_id, vacancy_id]);
      return {id: result.insertId, user_id, vacancy_id, status: 'Applied'};
    },

    updateApplicantStatus: async (_, { id, status }) => {
      await db.query("UPDATE applicants SET status = ? WHERE id = ?",[status, id]);
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?",[id]);
      return rows[0];
    },

    deleteApplicant: async (_, { id }) => {
      await db.query("DELETE FROM applicants WHERE id = ?",[id]);
      return "Applicant deleted successfully";
    }

  }
};

module.exports = applicantResolvers;