import express from "express";
import cors from "cors";
import morgan from "morgan";

import connectDB from "./db.js";

import entry from "./routes/entry/entry.js";

const app = express();
connectDB("cdj").catch(err => console.log(err));

// use cors middleware
app.use(cors());

// only parse json
app.use(express.json());

app.use(morgan("dev"));

// use the entry router path '/journal/:journalId/'
app.use('/', entry);

app.use("*", (req, res) => {
    res.json({ message: "Page not found" });
});

export default app;