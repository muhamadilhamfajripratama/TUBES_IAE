const db = require('../config/db');

const interviewResolvers = {
  Query: {
    getInterviews: async () => {
      const [rows] = await db.query(`
        SELECT i.*, u.name AS applicant_name 
        FROM interviews i 
        LEFT JOIN applicant_db.applicants a ON i.applicant_id = a.id 
        LEFT JOIN user_db.users u ON a.user_id = u.id
      `);

      return rows.map(row => ({
          ...row,
          scheduled_at:
              row.scheduled_at
                  ? row.scheduled_at
                      .toISOString()
                      .slice(0,19)
                      .replace("T"," ")
                  : null
      }));
    },

    getInterviewById: async (_, { id }) => {
      const [rows] = await db.query(`
        SELECT i.*, u.name AS applicant_name 
        FROM interviews i 
        LEFT JOIN applicant_db.applicants a ON i.applicant_id = a.id 
        LEFT JOIN user_db.users u ON a.user_id = u.id
        WHERE i.id = ?
      `, [id]);

      if(!rows[0]) return null;

      return {
          ...rows[0],
          scheduled_at:
              rows[0].scheduled_at
                  ? rows[0].scheduled_at
                      .toISOString()
                      .slice(0,19)
                      .replace("T"," ")
                  : null
      };
    },

    getInterviewByApplicant: async (_, { applicant_id }) => {
      const [rows] = await db.query(`
        SELECT i.*, u.name AS applicant_name 
        FROM interviews i 
        LEFT JOIN applicant_db.applicants a ON i.applicant_id = a.id 
        LEFT JOIN user_db.users u ON a.user_id = u.id
        WHERE i.applicant_id = ?
      `, [applicant_id]);

      return rows.map(row => ({
          ...row,
          scheduled_at:
              row.scheduled_at
                  ? row.scheduled_at
                      .toISOString()
                      .slice(0,19)
                      .replace("T"," ")
                  : null
      }));
    }
  },

  Mutation: {
    scheduleInterview: async (_,{ applicant_id, scheduled_at, interviewer }) => {
      const [result] = await db.query(`INSERT INTO interviews(applicant_id, scheduled_at, interviewer) VALUES (?, ?, ?)`,
        [applicant_id,scheduled_at,interviewer]);
      const [rows] = await db.query(`
        SELECT i.*, u.name AS applicant_name 
        FROM interviews i 
        LEFT JOIN applicant_db.applicants a ON i.applicant_id = a.id 
        LEFT JOIN user_db.users u ON a.user_id = u.id
        WHERE i.id = ?
      `, [result.insertId]);

      return {
          ...rows[0],
          scheduled_at:
              rows[0].scheduled_at
                  ? rows[0].scheduled_at
                      .toISOString()
                      .slice(0,19)
                      .replace("T"," ")
                  : null
      };
    },

    rescheduleInterview: async (_,{ id, scheduled_at }) => {
      await db.query(`UPDATE interviews SET scheduled_at = ? WHERE id = ? `,[scheduled_at,id]);
      const [rows] = await db.query(`
        SELECT i.*, u.name AS applicant_name 
        FROM interviews i 
        LEFT JOIN applicant_db.applicants a ON i.applicant_id = a.id 
        LEFT JOIN user_db.users u ON a.user_id = u.id
        WHERE i.id = ?
      `, [id]);

      return {
          ...rows[0],
          scheduled_at:
              rows[0].scheduled_at
                  ? rows[0].scheduled_at
                      .toISOString()
                      .slice(0,19)
                      .replace("T"," ")
                  : null
      };
    },

    deleteInterview: async (_, { id }) => {
      await db.query("DELETE FROM interviews WHERE id = ?",[id]);
      return "Interview deleted successfully";
    }
  }
};

module.exports = interviewResolvers;