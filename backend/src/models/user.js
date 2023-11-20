import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    password_salt: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Assuming users will often be queried by email and it must be unique.
userSchema.index({ email: 1 }, { unique: true, background: true });

// Useful if searching by full name is common.
userSchema.index({ fname: 1, lname: 1 });

export default model('User', userSchema);