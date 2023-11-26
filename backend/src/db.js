import { connect } from 'mongoose';

export default async function connectDB(dbName) {
    // only connect if not testing otherwise connect to test db
    if (process.env.NODE_ENV !== 'test') {
        await connect(`mongodb://localhost:27017/${ dbName }`);
    } else {
        await connect(`mongodb://localhost:27017/${ dbName }-test`);
    }
}