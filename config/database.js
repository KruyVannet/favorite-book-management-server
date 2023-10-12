module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        client: 'mongo',
        uri: env('DATABASE_CONNECTION', 'mongodb://localhost:27017/bookmanagement'),
      },
    },
  },
});
