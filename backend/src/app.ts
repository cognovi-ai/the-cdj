import { access, entry } from './routes/index.js';
import express, { Express, NextFunction, Request, Response } from 'express';
import ExpressError from './utils/ExpressError.js';
import User from './models/user.js';
import connectDB from './db.js';
import cors from 'cors';
import { createStore } from './store.js';
import flash from 'connect-flash';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import rateLimit from 'express-rate-limit';
import session from 'express-session';

const app: Express = express();

// Connect to database if not testing
if (process.env.NODE_ENV !== 'test') {
  connectDB('cdj').catch((err) => console.log(err));
}

// Use helmet middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['self'],
        baseUri: ['self'],
        blockAllMixedContent: [],
        fontSrc: ['self', 'https:', 'data:'],
        frameAncestors: ['self'],
        imgSrc: ['self', 'data:'],
        objectSrc: ['none'],
        scriptSrc: ['self'],
        scriptSrcAttr: ['none'],
        styleSrc: ['self', 'https:', 'unsafe-inline'],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Use cors middleware
app.use(
  cors({
    origin: [
      process.env.ORIGIN_SELF!,
      process.env.ORIGIN_LOCAL!,
      process.env.ORIGIN_PUBLIC!,
      process.env.ORIGIN_DOMAIN!,
    ],
    credentials: true,
  })
);

// Use json middleware
app.use(express.json());

// Use session middleware
app.use(
  session({
    store: createStore(
      process.env.NODE_ENV === 'production' ? 'redis' : 'memory'
    ),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  })
);

// Use flash
app.use(flash());

// Use passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate('session'));

// Passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Use rate limit middleware
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: (req: Request) => (req.isAuthenticated() ? 500 : 10),
    keyGenerator: (req: Request) => {
      if (req.isAuthenticated()) {
        return (req.user as Express.User)?.id ?? 'unauthenticated-user';
      } else {
        return req.ip + ':' + (req.sessionID || 'unauth');
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again after 10 minutes.',
    handler: function (req: Request, res: Response, next: NextFunction) {
      next(new ExpressError(this.message, 429));
    },
  })
);

// Log requests
app.use(morgan('dev'));

// Routes
app.use('/journals/:journalId/entries', entry);
app.use('/access', access);

// 404 handler
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new ExpressError('Page Not Found.', 404));
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: ExpressError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message = 'Something went wrong.' } = err;

  if (statusCode >= 500) {
    req.flash('error', message);
  } else if (statusCode === 400 || statusCode === 404) {
    req.flash('info', message);
  } else {
    req.flash('warning', message);
  }

  res.status(statusCode).json({ flash: req.flash() });
});

export default app;
