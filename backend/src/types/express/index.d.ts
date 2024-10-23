/** This file is used to extend Express types with custom properties. 
 * 
 * Note that Passport extends the Request object with a user property. To use
 * id on the Express.User type, Express.User must be extended to include id 
 * that passport sets on the user object.
 */

declare namespace Express {
  interface User {
    id: string; 
  }
}