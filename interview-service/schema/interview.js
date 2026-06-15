const interviewTypeDefs = `#graphql
  type Interview {
    id: ID!
    applicant_id: Int!
    applicant_name: String
    scheduled_at: String!
    interviewer: String!
    result: String
    notes: String
  }

  type Query {
    getInterviews: [Interview]
    getInterviewById(id: ID!): Interview
    getInterviewByApplicant(applicant_id: Int!): [Interview]
  }

  type Mutation {
    scheduleInterview(applicant_id: Int!, scheduled_at: String!, interviewer: String!): Interview
    rescheduleInterview(id: ID!, scheduled_at: String!): Interview
    updateInterviewResult(id: ID!, result: String!, notes: String): Interview
    deleteInterview(id: ID!): String
  }
`;

module.exports = interviewTypeDefs;