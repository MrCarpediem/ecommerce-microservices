const { MongoClient } = require('mongodb');

async function test() {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/test';
  console.log('Testing connection to:', uri);
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB!');
    const dbs = await client.db().admin().listDatabases();
    console.log('Databases:', dbs.databases.map(d => d.name));
    await client.close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

test();
