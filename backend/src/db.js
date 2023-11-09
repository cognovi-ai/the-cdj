import { connect } from 'mongoose';

export default async function connectDB(dbName) {
    await connect(`mongodb://127.0.0.1:27017/${ dbName }`);
}