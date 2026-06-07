const db = require('../config/db');

const interviewResolvers = {
  Query: {
    getInterviews: async () => {

    const [rows] = await db.query(
        "SELECT * FROM interviews"
    );

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

    /*getInterviews: async () => {
      const [rows] = await db.query("SELECT * FROM interviews");
      return rows;
    },*/

    /*getInterviewById: async (_, { id }) => {
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?",[id]);
      return rows[0];
    },*/
    getInterviewById: async (_, { id }) => {

    const [rows] = await db.query(
        "SELECT * FROM interviews WHERE id=?",
        [id]
    );

    if(!rows[0]) return null;

    return {
        ...rows[0],
        scheduled_at:
            rows[0].scheduled_at
                .toISOString()
                .slice(0,19)
                .replace("T"," ")
    };
},

    getInterviewByApplicant: async (_, { applicant_id }) => {
      const [rows] = await db.query("SELECT * FROM interviews WHERE applicant_id = ?",[applicant_id]);
      return rows;
    }

  },

  Mutation: {

    scheduleInterview: async (_,{ applicant_id, scheduled_at, interviewer }) => {
      const [result] = await db.query(`INSERT INTO interviews(applicant_id, scheduled_at, interviewer)VALUES (?, ?, ?)`,
        [applicant_id,scheduled_at,interviewer]);
      return {id: result.insertId, applicant_id, scheduled_at, interviewer};
    },

    rescheduleInterview: async (_,{ id, scheduled_at }) => {
      await db.query(`UPDATE interviews SET scheduled_at = ? WHERE id = ? `,[scheduled_at,id]);
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?",[id]);
      return rows[0];
    },

    deleteInterview: async (_, { id }) => {
      await db.query("DELETE FROM interviews WHERE id = ?",[id]);
      return "Interview deleted successfully";
    }

  }
};

module.exports = interviewResolvers;