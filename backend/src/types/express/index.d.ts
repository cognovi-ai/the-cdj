/** This file is used to extend Express types to match CDJ models with declaration merging. 
 * 
 * Passport extends global.Express.User for use in its extension of global.Express.Request
 * We extend global.Express.User to match the CDJ's UserType.
 */

import { UserType } from '../../models/user.ts';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends UserType {}
  }
}
