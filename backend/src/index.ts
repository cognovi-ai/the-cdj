/*
 * Main entry point for the backend server.
 * 
 * On import of `app`, an instance of the Express application is created. This 
 * file manages the server startup and shutdown logic.
 */

/* eslint-disable sort-imports, import/first */

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import fs from 'fs';
import https from 'https';
import { Server } from 'http';

const port = process.env.PORT;
export let server: Server<any, any>;

if (process.env.NODE_ENV !== 'production') {
  // Start the server in development or test mode
  server = app.listen(port, () => {
    console.log(`\nExpress listening on port ${ port }`);
  });
  
} else {
  // Start the server in production mode
  const { PRIVATE_KEY_PATH, CERTIFICATE_PATH, CA_PATH } = process.env;

  if (!PRIVATE_KEY_PATH || !CERTIFICATE_PATH || !CA_PATH) {
    console.error('Environment variables PRIVATE_KEY_PATH, CERTIFICATE_PATH, and CA_PATH must be set');
    process.exit(1);
  }

  try {
    const privateKey = fs.readFileSync(PRIVATE_KEY_PATH, 'utf8');
    const certificate = fs.readFileSync(CERTIFICATE_PATH, 'utf8');
    const ca = fs.readFileSync(CA_PATH, 'utf8');

    const credentials = { key: privateKey, cert: certificate, ca };
    const httpsServer = https.createServer(credentials, app);

    httpsServer.listen(port, () => {
      console.log(`\nHTTPS listening on port ${ port }`);
    });
  } catch (error) {
    console.error('HTTPS server error:', error);
  }
}

/**
 * Gracefully shutdown the server
 */
function closeServer() {
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
}

// Listen for SIGINT signal (Ctrl+C)
process.on('SIGINT', closeServer);

// Listen for SIGTERM signal (system shutdown)
process.on('SIGTERM', closeServer);