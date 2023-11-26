import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";
import session from "express-session";
import User from "./models/user.js";

import connectDB from "./db.js";

import { entry, access } from "./routes/index.js";
import ExpressError from "./utils/ExpressError.js";

// load environment variables
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const app = express();

// connect to database if not testing
if (process.env.NODE_ENV !== 'test') {
    connectDB("cdj").catch(err => console.log(err));
}

// use cors middleware
app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.50.157:5173"],
    credentials: true
}));

// use json middleware
app.use(express.json());

// use session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
}));

// use passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));

// passport config
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// log requests
app.use(morgan("dev"));

// routes
app.use("/journals/:journalId/entries", entry);
app.use("/access", access);

// 404 handler
app.use("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({ message: message });
});

export default app;