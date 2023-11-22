import { Entry, EntryAnalysis, EntryConversation } from '../models/index.js';
import ExpressError from '../utils/ExpressError.js';

/**
 * Validate the request body for an entry.
 */
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

/**
 * Validate the request body for an entry conversation.
 */
export const validateEntryConversation = (req, res, next) => {
    const { error, value } = EntryConversation.joi.validate(req.body);

    if (error) {
        console.log(error);

        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        req.body = value;
        next();
    }
}