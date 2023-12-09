import app from './src/app.js';
import dotenv from 'dotenv';
import fs from 'fs';
import https from 'https';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf8');

const credentials = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(process.env.HTTPS_PORT, () => {
  console.log(`\nHTTPS Listening on port ${ process.env.HTTPS_PORT }`);
});
