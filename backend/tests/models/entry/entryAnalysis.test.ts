/* @jest-environment node */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { EntryAnalysis } from '../../../src/models/index.js';
import connectDB from '../../../src/db.js';
import mongoose from 'mongoose';

describe('EntryAnalysis Model Test', () => {
  let entryAnalysisObject: any;
  let expectedResult: any;

  beforeAll(async () => {
    await connectDB('cdj');
  });

  beforeEach(() => {
    jest.clearAllMocks();
    entryAnalysisObject = {
      analysis_content: 'test analysis content',
    };
    expectedResult = {
      analysis_content: 'test analysis content',
    };
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('succeeds on valid analysis_content ', () => {
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows empty string for analysis_content and replaces with default', () => {
    entryAnalysisObject.analysis_content = '';
    expectedResult.analysis_content = 'Analysis not available';
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('trims whitespace from analysis_content', () => {
    entryAnalysisObject.analysis_content = 'test content'
      .padEnd(100, ' ')
      .padStart(100, ' ');
    expectedResult.analysis_content = 'test content';
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows arbitrary length for analysis_content', () => {
    const MAX_NODE_STRING_LENGTH = 2 ** 29 - 24;
    entryAnalysisObject.analysis_content = 'a'.repeat(MAX_NODE_STRING_LENGTH);
    expectedResult.analysis_content = 'a'.repeat(MAX_NODE_STRING_LENGTH);
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if analysis_content not a string', () => {
    entryAnalysisObject.analysis_content = true;
    expectedResult.analysis_content = true;
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if property not in schema passed in', () => {
    entryAnalysisObject.invalid_property = true;
    expectedResult.invalid_property = true;
    const { error, value } = EntryAnalysis.joi(entryAnalysisObject);

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });
});
