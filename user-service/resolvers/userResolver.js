const db = require('../config/db');

const userResolvers = {
  Query: {

    getUsers: async () => {
      const [rows] = await db.query("SELECT id, name, email, role FROM users");
      return rows;
    },

    getUserById: async (_, { id }) => {
      const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?",[id]);
      return rows[0];
    },

    getUsersByRole: async (_, { role }) => {
      const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE role = ?",[role]);
      return rows;
    }

  },

  Mutation: {

    createUser: async (_, { name, email, role, password }) => {
      const query ="INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)";
      const [result] = await db.query(query,[name, email, role, password]);
      return {id: result.insertId, name, email, role};
    },

    updateUser: async (_, { id, name, email, role }) => {
      await db.query("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",[name, email, role, id]);
      const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?",[id]);
      return rows[0];
    },

    deleteUser: async (_, { id }) => {
      await db.query("DELETE FROM users WHERE id = ?",[id]);
      return "User successfully deleted";
    }

  }
};

module.exports = userResolvers;