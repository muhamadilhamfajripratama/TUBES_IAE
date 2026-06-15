const db = require('../config/db');

// Helper to fetch applicant name from applicant-service
async function fetchApplicantName(applicantId) {
  try {
    const response = await fetch('http://applicant-service:4003/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ getApplicantById(id: "${applicantId}") { user_name } }` })
    });
    const result = await response.json();
    if (result.data && result.data.getApplicantById) {
      return result.data.getApplicantById.user_name;
    }
  } catch (err) {
    console.error("Error fetching applicant name:", err);
  }
  return null;
}

async function populateInterviewData(row) {
  if (!row) return null;
  const applicant_name = await fetchApplicantName(row.applicant_id);
  
  let formattedDate = null;
  if (row.scheduled_at) {
    const d = new Date(row.scheduled_at);
    // adjust to GMT+7 or keep as is? The original code did:
    // row.scheduled_at.toISOString().slice(0,19).replace("T"," ")
    // Let's replicate original logic:
    if (typeof row.scheduled_at.toISOString === 'function') {
      formattedDate = row.scheduled_at.toISOString().slice(0,19).replace("T"," ");
    } else {
      formattedDate = d.toISOString().slice(0,19).replace("T"," ");
    }
  }

  return {
      ...row,
      applicant_name,
      scheduled_at: formattedDate
  };
}

async function populateInterviewsData(rows) {
  return await Promise.all(rows.map(populateInterviewData));
}

const interviewResolvers = {
  Query: {
    getInterviews: async () => {
      const [rows] = await db.query("SELECT * FROM interviews");
      return await populateInterviewsData(rows);
    },

    getInterviewById: async (_, { id }) => {
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?", [id]);
      return await populateInterviewData(rows[0]);
    },

    getInterviewByApplicant: async (_, { applicant_id }) => {
      const [rows] = await db.query("SELECT * FROM interviews WHERE applicant_id = ?", [applicant_id]);
      return await populateInterviewsData(rows);
    }
  },

  Mutation: {
    scheduleInterview: async (_,{ applicant_id, scheduled_at, interviewer }) => {
      const [result] = await db.query(`INSERT INTO interviews(applicant_id, scheduled_at, interviewer) VALUES (?, ?, ?)`,
        [applicant_id,scheduled_at,interviewer]);
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?", [result.insertId]);
      return await populateInterviewData(rows[0]);
    },

    rescheduleInterview: async (_,{ id, scheduled_at }) => {
      await db.query(`UPDATE interviews SET scheduled_at = ? WHERE id = ? `,[scheduled_at,id]);
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?", [id]);
      return await populateInterviewData(rows[0]);
    },

    updateInterviewResult: async (_, { id, result, notes }) => {
      await db.query(`UPDATE interviews SET result = ?, notes = ? WHERE id = ?`, [result, notes, id]);
      const [rows] = await db.query("SELECT * FROM interviews WHERE id = ?", [id]);
      return await populateInterviewData(rows[0]);
    },

    deleteInterview: async (_, { id }) => {
      await db.query("DELETE FROM interviews WHERE id = ?",[id]);
      return "Interview deleted successfully";
    }
  }
};

module.exports = interviewResolvers;