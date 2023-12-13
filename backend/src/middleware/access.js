import ExpressError from '../utils/ExpressError.js';

import jwt from 'jsonwebtoken';

export const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to the next middleware
  }

  // User is not authenticated, return an error
  return next(new ExpressError('You must be logged in to access this page.', 401));
};

export const isLoggedIn = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, token) => {
      if (err) {
        return next(new ExpressError('You are trying to access a protected route with an invalid token.', 401));
      }

      req.token = token;
      return next();
    });
  } else {
    return next();
  }
};
