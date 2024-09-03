/**
 * Set the port for the server to listen on based on the environment.
 * 
 * @returns A port number or 0 if test environment.
 */
export function getPort(): number {
  const PORT = process.env.PORT;
  if (PORT === undefined) {
    throw new Error('Environment variable PORT must be set');
  }

  if (process.env.NODE_ENV === 'test') {
    return 0;
  }
  return parseInt(PORT);
}