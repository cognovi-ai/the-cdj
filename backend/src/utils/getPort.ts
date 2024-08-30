import { Server } from 'http';

/**
 * Set the port for the server to listen on based on the environment.
 * 
 * @returns A promise that resolves to the port number.
 */
export default async function getPort(): Promise<number> {
  let port: string | number | undefined = process.env.PORT;

  if (!port) throw new Error('Environment variable PORT must be set');
  else port = parseInt(port, 10);
  
  // Increment the port by 1 if the environment is test.
  if (process.env.NODE_ENV === 'test') port += 1;
  else return port;
  
  // Find an open port if the specified port is in use.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const inUse = await isPortInUse(port);
  
    if (!inUse) {
      return port;
    }
  
    port += 1;
  }
}
  
/**
 * Check if a port is in use.
 * 
 * @param port - The port to check.
 * 
 * @returns A promise that resolves to a boolean indicating if the port is in 
 * use.
 */
async function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = new Server();
  
    server.on('error', () => {
      resolve(true);
    });
      
    server.on('listening', () => {
      server.close();
      resolve(false);
    });
      
    server.listen(port);
  });
}