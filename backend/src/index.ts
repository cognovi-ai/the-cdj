/* eslint-disable sort-imports, import/first */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import fs from 'fs';
import https from 'https';

const port = process.env.PORT;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`\nExpress listening on port ${ port }`);
  });
} else {
  const privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH || '', 'utf8');
  const certificate = fs.readFileSync(process.env.CERTIFICATE_PATH || '', 'utf8');
  const ca = fs.readFileSync(process.env.CA_PATH || '', 'utf8');

  const credentials = { key: privateKey, cert: certificate, ca };
  const httpsServer = https.createServer(credentials, app);

  httpsServer.listen(port, () => {
    console.log(`\nHTTPS listening on port ${ port }`);
  });
}
