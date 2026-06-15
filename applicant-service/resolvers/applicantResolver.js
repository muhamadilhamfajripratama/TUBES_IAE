const db = require('../config/db');

// Helper to fetch user from user-service
async function fetchUserName(userId) {
  try {
    const response = await fetch('http://user-service:4001/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ getUserById(id: "${userId}") { name } }` })
    });
    const result = await response.json();
    if (result.data && result.data.getUserById) {
      return result.data.getUserById.name;
    }
  } catch (err) {
    console.error("Error fetching user:", err);
  }
  return null;
}

// Helper to fetch vacancy from vacancy-service
async function fetchVacancyTitle(vacancyId) {
  try {
    const response = await fetch('http://vacancy-service:4002/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: `{ getVacancyById(id: "${vacancyId}") { title } }` })
    });
    const result = await response.json();
    if (result.data && result.data.getVacancyById) {
      return result.data.getVacancyById.title;
    }
  } catch (err) {
    console.error("Error fetching vacancy:", err);
  }
  return null;
}

async function populateApplicantData(applicant) {
  if (!applicant) return null;
  const user_name = await fetchUserName(applicant.user_id);
  const vacancy_title = await fetchVacancyTitle(applicant.vacancy_id);
  return { ...applicant, user_name, vacancy_title };
}

async function populateApplicantsData(applicants) {
  return await Promise.all(applicants.map(populateApplicantData));
}

const applicantResolvers = {
  Query: {
    getApplicants: async () => {
      const [rows] = await db.query("SELECT * FROM applicants");
      return await populateApplicantsData(rows);
    },
    getApplicantById: async (_, { id }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?", [id]);
      return await populateApplicantData(rows[0]);
    },
    getApplicantsByUser: async (_, { user_id }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE user_id = ?", [user_id]);
      return await populateApplicantsData(rows);
    },
    getApplicantsByStatus: async (_, { status }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE status = ?", [status]);
      return await populateApplicantsData(rows);
    },
    getApplicantsByAdministrasiStatus: async (_, { status }) => {
      const [rows] = await db.query("SELECT * FROM applicants WHERE administrasi_status = ?", [status]);
      return await populateApplicantsData(rows);
    }
  },
  Mutation: {
    applyJob: async (_, { user_id, vacancy_id, cv }) => {
      // Validasi duplikasi
      const [existing] = await db.query("SELECT * FROM applicants WHERE user_id = ? AND vacancy_id = ?", [user_id, vacancy_id]);
      if (existing.length > 0) {
        throw new Error("You have already applied for this vacancy.");
      }

      const query = `INSERT INTO applicants(user_id, vacancy_id, cv, status, administrasi_status) VALUES (?, ?, ?, 'Applied', 'Pending')`;
      const [result] = await db.query(query,[user_id, vacancy_id, cv || null]);
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?", [result.insertId]);
      return await populateApplicantData(rows[0]);
    },
    updateApplicantStatus: async (_, { id, status }) => {
      await db.query("UPDATE applicants SET status = ? WHERE id = ?",[status, id]);
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?", [id]);
      return await populateApplicantData(rows[0]);
    },
    updateAdministrasiStatus: async (_, { id, status }) => {
      await db.query("UPDATE applicants SET administrasi_status = ? WHERE id = ?",[status, id]);
      const [rows] = await db.query("SELECT * FROM applicants WHERE id = ?", [id]);
      return await populateApplicantData(rows[0]);
    },
    deleteApplicant: async (_, { id }) => {
      await db.query("DELETE FROM applicants WHERE id = ?",[id]);
      return "Applicant deleted successfully";
    }
  }
};

module.exports = applicantResolvers;