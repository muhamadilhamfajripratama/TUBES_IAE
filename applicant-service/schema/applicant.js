const applicantTypeDefs = `#graphql
  type Applicant {
    id: ID!
    user_id: Int!
    vacancy_id: Int!
    status: String!
  }

  type Query {
    getApplicants: [Applicant]
    getApplicantById(id: ID!): Applicant
    getApplicantsByUser(user_id: Int!): [Applicant] # Berguna untuk dashboard pelamar agar hanya melihat lamarannya sendiri
    getApplicantsByStatus(status: String!): [Applicant]
  }

  type Mutation {
    applyJob(user_id: Int!, vacancy_id: Int!): Applicant
    updateApplicantStatus(id: ID!, status: String!): Applicant # Untuk HR saat mengubah status Screening/Interview
    deleteApplicant(id: ID!): String

  }
`;

module.exports = applicantTypeDefs;