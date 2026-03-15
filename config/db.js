const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nsup1w5.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    db = client.db('pawmart');
    if (process.env.NODE_ENV !== 'production') {
      console.log('Connected to MongoDB');
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not connected');
  return db;
};

module.exports = { connectDB, getDB, client };