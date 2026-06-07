const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema/applicant');
const resolvers = require('./resolvers/applicantResolver');

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4003 } })
  .then(({ url }) => console.log(`🚀 Applicant Service ready at ${url}`));