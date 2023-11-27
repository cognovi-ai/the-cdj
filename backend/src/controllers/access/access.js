import { Journal, User } from '../../models/index.js';

import ExpressError from '../../utils/ExpressError.js';

import passport from 'passport';

import { validateJournal } from '../../middleware/validation.js';

/**
 * Login a user.
 */
export const login = async (req, res, next) => {
  console.log('Logging in...');

  try {
    const user = await new Promise((resolve, reject) => {
      passport.authenticate('local', (err, user, info) => {
        console.log('Authenticating...');

        if (err) {
          console.log(`Authentication error: ${ err }`);
          return reject(err);
        }

        if (!user) {
          console.log(`Login failed: ${ info.message }`);
          return reject(new ExpressError(info.message, 401));
        }

        console.log(`User found: ${ user._id }`);
        resolve(user);
      })(req, res, next);
    });

    req.logIn(user, async (err) => {
      if (err) {
        console.log(`Error in req.logIn: ${ err }`);
        return next(err);
      }

      console.log(`User logged in: ${ user._id }`);

      // Handle successful login
      let journal = await Journal.findOne({ user: user._id });

      if (!journal) {
        console.log(`Creating a new journal for user ${ user._id }...`);
        journal = new Journal({ user: user._id });
        await journal.save();
      } else {
        console.log(`Journal found for user ${ user._id }: ${ journal._id }`);
      }

      // Return the journal id and title
      res.status(200).json({ journalId: journal._id, journalTitle: journal.title });
    });
  } catch (error) {
    console.log(`Error in login process: ${ error }`);
    next(error);
  }
};

/**
 * Logout a user.
 */
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};

/**
 * Register a new user.
 */
export const register = async (req, res, next) => {
  const { fname, lname, email, password } = req.body;

  try {
    const newUser = await User.register(new User({ email, fname, lname }), password);

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
    return next(new ExpressError('Email already in use', 409));
  }
};
