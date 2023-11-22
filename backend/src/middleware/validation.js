import { Entry, EntryAnalysis, EntryConversation } from '../models/index.js';
import ExpressError from '../utils/ExpressError.js';

export const validateEntry = (req, res, next) => {
    const { error, value } = Entry.joi.validate(req.body);

    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        req.body = value;
        next();
    }
};
