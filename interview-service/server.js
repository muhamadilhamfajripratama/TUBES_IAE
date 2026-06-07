const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema/interview');
const resolvers = require('./resolvers/interviewResolver');

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4004 } })
  .then(({ url }) => console.log(`🚀 Interview Service ready at ${url}`));