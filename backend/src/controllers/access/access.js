import mongoose from 'mongoose';

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