/*
* Main entry point for the backend server.
*
* On import of `app`, an instance of the Express application is created. This
* file manages the server startup and shutdown logic.
*/

/* eslint-disable sort-imports */

import 'dotenv/config';

import app from './app.js';
import fs from 'fs';
import { getPort } from './utils/getPort.js';
import https from 'https';
import { Server } from 'http';

export let server: Server;

function startServer() {
  let port = getPort();

  if (process.env.NODE_ENV !== 'production') {
    // Start the server in development or test mode
    server = app.listen(port, () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        console.log(`\nExpress listening on port ${address.port}`);
      } else {
        console.log(`\nExpress listening on non-IP socket ${address}`);
      }
    });
  } else {
  // Start the server in production mode
    const { PRIVATE_KEY_PATH, CERTIFICATE_PATH, CA_PATH } = process.env;

    if (!PRIVATE_KEY_PATH || !CERTIFICATE_PATH || !CA_PATH) {
      console.error(
        'Environment variables PRIVATE_KEY_PATH, CERTIFICATE_PATH, and CA_PATH must be set'
      );
      throw new Error('Environment variables PRIVATE_KEY_PATH, CERTIFICATE_PATH, and CA_PATH must be set');
    }

    try {
      const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
      const certificate = fs.readFileSync(CERTIFICATE_PATH, 'utf8');
      const ca = fs.readFileSync(CA_PATH, 'utf8');

      const credentials = { key: privateKey, cert: certificate, ca };
      const httpsServer = https.createServer(credentials, app);

      httpsServer.listen(port, () => {
        console.log(`\nHTTPS listening on port ${port}`);
      });
    } catch (error) {
      console.error('HTTPS server error:', error);
    }
  }
}

/**
 * Gracefully shutdown the server
 */
function closeServer() {
  const server = app.locals.server as Server;
  server.close(() => {
    throw new Error('Server shutdown complete');
  });
}

// Listen for SIGINT signal (Ctrl+C)
process.on('SIGINT', closeServer);

// Listen for SIGTERM signal (system shutdown)
process.on('SIGTERM', closeServer);

startServer();