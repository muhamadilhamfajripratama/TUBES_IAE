const vacancyTypeDefs = `#graphql

  type Vacancy {
    id: ID!
    title: String!
    department: String!
    description: String
    status: String!
    start_apply: String
    end_apply: String
    created_at: String
  }

  type Query {
    getVacancies: [Vacancy]
    getVacancyById(id: ID!): Vacancy
    getOpenVacancies: [Vacancy]
  }

  type Mutation {
    createVacancy(
      title: String!
      department: String!
      description: String!
      status: String!
      start_apply: String
      end_apply: String
    ): Vacancy

    updateVacancy(
      id: ID!
      title: String
      department: String
      description: String
      status: String
      start_apply: String
      end_apply: String
    ): Vacancy

    deleteVacancy(
      id: ID!
    ): String
  }
`;

module.exports = vacancyTypeDefs;