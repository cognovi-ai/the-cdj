/**
 * @jest-environment node
 */

import ExpressError from '../../src/utils/ExpressError.js';

describe('ExpressError tests', () => {
  it('constructs a new ExpressError', () => {
    let expressError = new ExpressError('test', 404);

    expect(expressError.message).toBe('test');
    expect(expressError.statusCode).toBe(404);
  });
});