const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema/vacancy');
const resolvers = require('./resolvers/vacancyResolver');

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4002 } })
  .then(({ url }) => console.log(`🚀 Vacancy Service ready at ${url}`));