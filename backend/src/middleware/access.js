import ExpressError from '../utils/ExpressError.js';

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware
  }

  // User is not authenticated, return an error
  return next(new ExpressError('You must be logged in to access this page.', 401));
};
