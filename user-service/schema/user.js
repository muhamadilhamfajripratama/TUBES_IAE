const userTypeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    # Ingat: Password tidak kita masukkan di 'type User' agar tidak ikut terbaca saat Query demi keamanan!
  }

  type Query {
    getUsers: [User]
    getUserById(id: ID!): User
    getUsersByRole(role: String!): [User]
  }

  type Mutation {
    createUser(name: String!, email: String!, role: String!, password: String!): User
    updateUser(id: ID!, name: String, email: String, role: String): User
    deleteUser(id: ID!): String
  }
`;

module.exports = userTypeDefs;