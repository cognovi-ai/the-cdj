import ExpressError from '../utils/ExpressError.js';

export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        console.log("User is authenticated.");
        return next(); // User is authenticated, proceed to the next middleware
    }

    console.log("User is not authenticated.");
    // User is not authenticated, return an error
    return next(new ExpressError("You must be logged in to access this page.", 401));
};
