/**
 * @jest-environment node
 */

import catchAsync from '../../src/utils/catchAsync.js';

describe('catchAsync tests', () => {
  it('calls function passed into catchAsync', () => {
    let mockfn = jest.fn();

    let res = catchAsync(mockfn);

    expect(res).toBeInstanceOf(Function)
  }); 
});