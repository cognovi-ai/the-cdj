import { User, Journal } from '../../models/index.js';
import ExpressError from '../../utils/ExpressError.js';
import bcrypt from 'bcrypt';

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });

    if (!foundUser) {
        return next(new ExpressError('Invalid email/password', 401));
    }

    // compare password with hashed password
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
        console.log('Invalid password');
        return next(new ExpressError('Invalid email/password', 401));
    }

    res.status(200).json({ user: foundUser });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
    const { fname, lname, email, password } = req.body;

    // hash password
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    // create new user
    const newUser = new User({ fname, lname, email, password: hash });
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