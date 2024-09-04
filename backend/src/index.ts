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
import http from 'http';
import https from 'https';

// Start the server.
export const server: http.Server | https.Server| undefined = startServer();

// Shutdown the server on ctrl+C signal
process.on('SIGINT', closeServer);

// Shutdown the server on server kill signal
process.on('SIGTERM', closeServer);

/**
 * Start the server.
 */
export function startServer(): http.Server | https.Server | undefined {
  const port = process.env.NODE_ENV !== 'test' ? process.env.PORT : '0';
  
  if (port === undefined) {
    throw new Error('Environment variable PORT must be set');
  }

  if (process.env.NODE_ENV !== 'production') {
    // Start the server in development or test mode
    const httpServer = app.listen(port, () => {
      const address = httpServer.address();

      if (address && typeof address !== 'string') {
        console.log(`\nHTTP Express listening on port ${address.port}`);
      } else {
        throw new Error(`\nHTTP Express listening on non-IP socket ${address}`);
      }
    });

    return httpServer;
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
        const address = httpsServer.address();
        
        if (address && typeof address !== 'string') {
          console.log(`\nHTTPS Express listening on port ${address.port}`);
        } else {
          throw new Error(`\nHTTPS Express listening on non-IP socket ${address}`);
        }
      });

      return httpsServer;
    } catch (error) {
      console.error('HTTPS server error:', error);
    }
  }
}

/**
 * Gracefully shutdown the server.
 */
export function closeServer() {
  server?.close(() => {
    throw new Error('Server shutdown complete');
  });

  // Force shutdown after 10 seconds.
  setTimeout(() => {
    throw new Error('Server shutdown timed out');
  }, 10000);
}