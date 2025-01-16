import { NextFunction, Request, Response } from 'express';
import ExpressError from '../utils/ExpressError.js';
import User from '../models/user.js';
import { UserType } from '../models/user.js';
import jwt from 'jsonwebtoken';

// Module augmentation to add `token` property to `Request`
declare module 'express-serve-static-core' {
  interface Request {
    token?: string | jwt.JwtPayload;
  }
}

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(
    new ExpressError('You must be logged in to access this page.', 401)
  );
};

export const isLoggedIn = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers ? req.headers.authorization : undefined;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if (err) {
          return next(
            new ExpressError(
              'You are trying to access a protected route with an invalid token.',
              401
            )
          );
        }
        req.token = decoded;
        return next();
      }
    );
  } else {
    return next();
  }
};

export const requestBetaAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (process.env.RELEASE_PHASE !== 'beta') return next();

  const { fname, lname, email } = req.body;

  try {
    let user = (await User.findOne({ email })) as UserType | null;

    if (!user) {
      user = new User({ email, fname, lname }) as UserType;
    } else if (
      user.betaAccess === undefined ||
      (user.betaAccess === false &&
        user.betaAccessTokenExpires === undefined)
    ) {
      if (!user.emailVerified) {
        return next(
          new ExpressError(
            'You must verify your email address in order for your beta request to be reviewed.',
            403
          )
        );
      }
      return next(
        new ExpressError('Beta access is pending approval.', 403)
      );
    } else if (user.betaAccess === true) {
      return next();
    }

    if (
      user.betaAccess === false &&
      user.betaAccessTokenExpires &&
      user.betaAccessTokenExpires.getTime() > Date.now()
    ) {
      return next(
        new ExpressError(
          `Beta access has been denied you may apply again after ${user.betaAccessTokenExpires.toLocaleDateString()}.`,
          403
        )
      );
    }

    await user.sendBetaAccessVerificationEmail(
      user.generateEmailVerificationToken()
    );

    await user.save();

    req.flash(
      'info',
      `${fname}, by signing up you have requested beta access. Please look for an email from The CDJ Team to verify your email address. Once verified, your application will be considered. You will then receive a follow-up email with our decision and instructions to access your account. Thank you for your interest in the app!`
    );
    res.status(200).json({ flash: req.flash() });
  // TODO: Add server-side logging for errors; Expand ExpressError to include a 
  // `log` method to log errors from catch blocks to a file.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    return next(
      new ExpressError(
        'An error occurred while attempting to request beta access.',
        500
      )
    );
  }
};