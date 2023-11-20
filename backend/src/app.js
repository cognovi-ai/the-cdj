import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./db.js";

import { entry, access } from "./routes/index.js";
import ExpressError from "./utils/ExpressError.js";

const app = express();

// connect to database
connectDB("cdj").catch(err => console.log(err));

// use cors middleware
app.use(cors());

// use json middleware
app.use(express.json());

// log requests
app.use(morgan("dev"));

// routes
app.use("/journals/:journalId/entries", entry);
app.use("/access", access);

// 404 handler
app.use("*", (req, res) => {
    next(new ExpressError("Page Not Found", 404));
});

// error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({ message: message });
});

export default app;