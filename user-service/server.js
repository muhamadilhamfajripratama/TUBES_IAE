const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const typeDefs = require('./schema/user');
const resolvers = require('./resolvers/userResolver');

const server = new ApolloServer({ typeDefs, resolvers });

startStandaloneServer(server, { listen: { port: 4001 } })
  .then(({ url }) => console.log(`🚀 User Service ready at ${url}`));