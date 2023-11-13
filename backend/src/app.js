import express from "express";
import cors from "cors";

import connectDB from "./db.js";

const app = express();
connectDB("cdj").catch(err => console.log(err));

app.use((req, res) => {
    res.send();
});

export default app;