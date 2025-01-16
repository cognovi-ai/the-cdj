import { connect } from 'mongoose';

export default async function connectDB(dbName: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      // Define the MongoDB Atlas URI for production
      const atlasUri = process.env.ATLAS_URI;
      
      // Connect to MongoDB Atlas in production
      if (!atlasUri) {
        throw new Error(
          'ATLAS_URI is not defined in the environment variables'
        );
      }

      await connect(atlasUri);
      console.log('Connected to MongoDB Atlas');
    } else if (process.env.NODE_ENV !== 'test') {
      // Define the local URI for development and testing
      const localUri = `${process.env.MONGO_URI}/${dbName}`;

      // Connect to the local MongoDB for development
      if (!localUri) {
        throw new Error(
          'MONGO_URI is not defined in the environment variables'
        );
      }

      await connect(localUri);
      console.log(`Connected to local MongoDB: ${localUri}`);
    } else {
      // Connect to the local test database
      await connect(`${process.env.MONGO_URI}/${dbName}-test`);
      console.log(`connected to ${process.env.MONGO_URI}`);
      console.log(`Connected to local test MongoDB: ${dbName}-test`);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}
