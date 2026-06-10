const db = require('../config/db');

const autoCloseVacancies = async () => {
  try {
    await db.query(`
      UPDATE vacancies 
      SET status = 'Closed' 
      WHERE status = 'Open' 
        AND end_apply IS NOT NULL 
        AND end_apply < CURDATE()
    `);
  } catch (err) {
    console.error("Error auto-closing vacancies:", err);
  }
};

const vacancyResolvers = {
  Query: {
    // GET ALL VACANCIES
    getVacancies: async () => {
      await autoCloseVacancies();
      const [rows] = await db.query(`
        SELECT
          id,
          title,
          department,
          description,
          status,
          start_apply,
          end_apply,
          created_at
        FROM vacancies
        ORDER BY id DESC
      `);
      return rows;
    },

    // GET VACANCY BY ID
    getVacancyById: async (_, { id }) => {
      await autoCloseVacancies();
      const [rows] = await db.query(`
        SELECT
          id,
          title,
          department,
          description,
          status,
          start_apply,
          end_apply,
          created_at
        FROM vacancies
        WHERE id = ?
      `, [id]);
      return rows[0];
    },

    // GET OPEN VACANCIES
    getOpenVacancies: async () => {
      await autoCloseVacancies();
      const [rows] = await db.query(`
        SELECT
          id,
          title,
          department,
          description,
          status,
          start_apply,
          end_apply,
          created_at
        FROM vacancies
        WHERE status = 'Open'
        ORDER BY id DESC
      `);
      return rows;
    }
  },

  Mutation: {
    // CREATE VACANCY
    createVacancy: async (
      _,
      {
        title,
        department,
        description,
        status,
        start_apply,
        end_apply
      }
    ) => {
      const query = `
        INSERT INTO vacancies (
          title,
          department,
          description,
          status,
          start_apply,
          end_apply
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      // Jika start_apply/end_apply kosong dari frontend, ubah jadi null agar MySQL tidak error
      const [result] = await db.query(query, [
        title,
        department,
        description,
        status,
        start_apply || null,
        end_apply || null
      ]);

      const [rows] = await db.query(`
        SELECT
          id,
          title,
          department,
          description,
          status,
          start_apply,
          end_apply,
          created_at
        FROM vacancies
        WHERE id = ?
      `, [result.insertId]);

      return rows[0];
    },

    // UPDATE VACANCY
    updateVacancy: async (
      _,
      {
        id,
        title,
        department,
        description,
        status,
        start_apply,
        end_apply
      }
    ) => {
      await db.query(`
        UPDATE vacancies
        SET
          title = ?,
          department = ?,
          description = ?,
          status = ?,
          start_apply = ?,
          end_apply = ?
        WHERE id = ?
      `, [
        title,
        department,
        description,
        status,
        start_apply || null,
        end_apply || null,
        id
      ]);

      const [rows] = await db.query(`
        SELECT
          id,
          title,
          department,
          description,
          status,
          start_apply,
          end_apply,
          created_at
        FROM vacancies
        WHERE id = ?
      `, [id]);

      return rows[0];
    },

    // DELETE VACANCY
    deleteVacancy: async (_, { id }) => {
      await db.query(
        "DELETE FROM vacancies WHERE id = ?",
        [id]
      );
      return "Vacancy deleted successfully";
    }
  }
};

module.exports = vacancyResolvers;