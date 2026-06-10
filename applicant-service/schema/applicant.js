const applicantTypeDefs = `#graphql
  type Applicant {
    id: ID!
    user_id: Int!
    vacancy_id: Int!
    user_name: String
    vacancy_title: String
    cv: String
    administrasi_status: String
    status: String!
  }

  type Query {
    getApplicants: [Applicant]
    getApplicantById(id: ID!): Applicant
    getApplicantsByUser(user_id: Int!): [Applicant] # Berguna untuk dashboard pelamar agar hanya melihat lamarannya sendiri
    getApplicantsByStatus(status: String!): [Applicant]
  }

  type Mutation {
    applyJob(user_id: Int!, vacancy_id: Int!, cv: String): Applicant
    updateApplicantStatus(id: ID!, status: String!): Applicant # Untuk HR saat mengubah status Screening/Interview
    updateAdministrasiStatus(id: ID!, status: String!): Applicant
    deleteApplicant(id: ID!): String

  }
`;

module.exports = applicantTypeDefs;