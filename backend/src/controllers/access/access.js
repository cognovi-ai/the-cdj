import { User, Journal } from '../../models/index.js';
import ExpressError from '../../utils/ExpressError.js';

import { validateJournal } from '../../middleware/validation.js';

import passport from 'passport';

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }

        if (!user) {
            // Handle login failure
            return next(new ExpressError(info.message, 401));
        }

        req.logIn(user, async (err) => {
            if (err) { return next(err); }
            // Handle successful login

            // retrieve the user's journal
            const journal = await Journal.findOne({ user: user._id });

            // if user has no journal, create one
            if (!journal) {
                console.log(`Creating a new journal for user ${ user._id }...`);
                const newJournal = new Journal({
                    user: user._id,
                });
                await newJournal.save();
            }

            // return the journal id and title
            res.status(200).json({ journalId: journal._id, journalTitle: journal.title });
        });
    })(req, res, next);
};

/**
 * Logout a user.
 */
export const logout = (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
    });
    res.status(200).json({ message: "Logged out successfully." });
}

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
    const { fname, lname, email, password } = req.body;

    try {
        const newUser = await User.register(new User({ email: email, fname, lname }), password);

        // Prepare data for validateJournal, if necessary
        // e.g., req.body.journalData = { ... }

        // Call validateJournal middleware
        validateJournal(req, res, async (err) => {
            if (err) return next(err); // Handle validation errors

            // Continue with creating the journal if validation is successful
            const newJournal = new Journal({ user: newUser._id, title: req.body.title });
            await newJournal.save();

            // Continue with the rest of the registration process
            req.login(newUser, err => {
                if (err) return next(err);
                res.status(200).json({ journalId: newJournal._id, journalTitle: newJournal.title });
            });
        });
    } catch (err) {
        if (err.code === 11000) {
            return next(new ExpressError('Email already in use', 400));
        } else {
            return next(err);
        }
    }
};
