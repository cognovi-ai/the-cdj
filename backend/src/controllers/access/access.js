import { User, Journal } from '../../models/index.js';
import ExpressError from '../../utils/ExpressError.js';

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
    // TODO: Implement password hashing and salting logic.
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email, password_hash: password });

    if (!foundUser) {
        return next(new ExpressError('Invalid email/password', 401));
    }

    res.status(200).json({ user: foundUser });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
    // TODO: Implement password hashing and salting logic.
    const { fname, lname, email, password } = req.body;
    const newUser = new User({ fname, lname, email, password_hash: password, password_salt: 'salt' });

    try {
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) {
            return next(new ExpressError('Email already in use', 400));
        }
        return next(err);
    }

    // Create a journal for the new user.
    const newJournal = new Journal({ user: newUser._id });
    await newJournal.save();

    res.status(201).json({ user: newUser, journal: newJournal });
}