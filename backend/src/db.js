import mongoose, { connect } from 'mongoose';

export default async function connectDB(dbName) {
  // Define the local URI for development and testing
  const localUri = `${ process.env.MONGO_URI }/${ dbName }`;

  // Define the MongoDB Atlas URI for production
  const atlasUri = process.env.ATLAS_URI;

  try {
    if (process.env.NODE_ENV === 'production') {
      // Connect to MongoDB Atlas in production
      await connect(atlasUri);
      console.log('Connected to MongoDB Atlas');
    } else if (process.env.NODE_ENV !== 'test') {
      // Connect to the local MongoDB for development
      await connect(localUri);
      console.log(`Connected to local MongoDB: ${ localUri }`);
    } else {
      // Connect to the local test database
      await connect(`mongodb://localhost:27017/${ dbName }-test`);
      console.log(`Connected to local test MongoDB: ${ dbName }-test`);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

export { mongoose as db };