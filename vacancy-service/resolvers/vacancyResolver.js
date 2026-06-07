const db = require('../config/db');

const vacancyResolvers = {

  Query: {

    getVacancies: async () => {
      const [rows] = await db.query("SELECT * FROM vacancies");
      return rows;
    },

    getVacancyById: async (_, { id }) => {
      const [rows] = await db.query("SELECT * FROM vacancies WHERE id = ?",[id]);
      return rows[0];
    },

    getOpenVacancies: async () => {
      const [rows] = await db.query("SELECT * FROM vacancies WHERE status = 'Open'");
      return rows;
    }

  },

  Mutation: {

    createVacancy: async (_,{ title, department, description, status }) => {
      const query = `INSERT INTO vacancies(title, department, description, status)VALUES (?, ?, ?, ?)`;
      const [result] = await db.query(query,[title, department, description, status]);
      return {id: result.insertId,title,department,description,status};
    },

    updateVacancy: async (_,{ id, title, department, description, status }) => {
      await db.query(`UPDATE vacancies SET title = ?,department = ?,description = ?,status = ? WHERE id = ?`,
        [
          title,
          department,
          description,
          status,
          id
        ]
      );

      const [rows] = await db.query("SELECT * FROM vacancies WHERE id = ?",[id]);
      return rows[0];
    },

    deleteVacancy: async (_, { id }) => {
      await db.query("DELETE FROM vacancies WHERE id = ?",[id]);
      return "Vacancy deleted successfully";
    }

  }

};

module.exports = vacancyResolvers;