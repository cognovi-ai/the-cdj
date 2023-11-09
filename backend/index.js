import express from "express";
import app from "./src/app.js";

const port = 3000;
const server = express();

server.use(app);

server.listen(port, () => {
    console.log(`\nEXPRESS Listening on port ${ port }.`);
});