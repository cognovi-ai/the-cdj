/**
 * @jest-environment node
 */

import catchAsync from '../../src/utils/catchAsync.js';

describe('catchAsync tests', () => {
  it('calls function passed into catchAsync', () => {
    const mockfn = jest.fn();

    const res = catchAsync(mockfn);

    expect(res).toBeInstanceOf(Function);
  }); 
});