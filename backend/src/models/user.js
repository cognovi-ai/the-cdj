import { Schema, model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const userSchema = new Schema({
    fname: { type: String, required: true },
    lname: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Assuming users will often be queried by email and it must be unique.
userSchema.index({ email: 1 }, { unique: true, background: true });

// Useful if searching by full name is common.
userSchema.index({ fname: 1, lname: 1 });

// Add passport-local-mongoose to User schema.
userSchema.plugin(passportLocalMongoose, {
    usernameField: 'email',
    errorMessages: {
        IncorrectPasswordError: 'Incorrect login credentials',
        IncorrectUsernameError: 'Incorrect login credentials',
        MissingUsernameError: 'No email was given',
        UserExistsError: 'Email already in use'
    }
});

export default model('User', userSchema);