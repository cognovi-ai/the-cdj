/**
 * @jest-environment node
 */

import { Entry } from "../../../src/models/index.js";

describe('Entry model tests', () => {
  let entryObject: any;
  let expectedResult: any;

  beforeEach(() => {
    entryObject = {
      title: 'My Journal',
      content: 'my content',
      mood: 'positive',
      tags: ['test', 'mock', 'jest'],
      privacy_settings: {
        public: false,
        shared_with: ['friend1', 'therapist1']
      },
    };
    expectedResult = {
      title: 'My Journal',
      content: 'my content',
      mood: 'positive',
      tags: ['test', 'mock', 'jest'],
      privacy_settings: {
        public: false,
        shared_with: ['friend1', 'therapist1']
      },
    };
  });

  it('succeeds on valid input', () => {
    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('replaces undefined title with Untitled', () => {
    delete entryObject.title;
    expectedResult.title = 'Untitled'

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('replaces empty title with Untitled', () => {
    entryObject.title = '';
    expectedResult.title = 'Untitled';

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if title length over 100 characters', () => {
    entryObject.title = 'a'.repeat(101);
    expectedResult.title = 'a'.repeat(101);

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('trims whitespace from title before validating length', () => {
    entryObject.title = 'a'.repeat(100).padEnd(5, ' ').padStart(5, ' ');
    expectedResult.title = 'a'.repeat(100);

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if content with less than 4 characters', () => {
    entryObject.content = '';
    expectedResult.content = '';

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('returns error if content with more than 1000 characters', () => {
    entryObject.content = 'a'.repeat(1001);
    expectedResult.content = 'a'.repeat(1001);

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('does not allow empty strings for mood', () => {
    entryObject.mood = '';
    expectedResult.mood = '';

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires mood to be a string', () => {
    entryObject.mood = {};
    expectedResult.mood = {};

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires tags to be array', () => {
    entryObject.tags = {};
    expectedResult.tags = {};

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires tags elements to be strings', () => {
    entryObject.tags = [true, false];
    expectedResult.tags = [true, false];

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires privacy_settings to be an object', () => {
    entryObject.privacy_settings = [];
    expectedResult.privacy_settings = [];

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('allows privacy_settings to be empty object', () => {
    entryObject.privacy_settings = {};
    expectedResult.privacy_settings = {};

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeUndefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires privacy_settings.public to be a boolean', () => {
    entryObject.privacy_settings.public = 1;
    expectedResult.privacy_settings.public = 1;

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

  it('requires privacy_settings.shared_with to be strings', () => {
    entryObject.privacy_settings.shared_with = 1;
    expectedResult.privacy_settings.shared_with = 1;

    const { error, value } = Entry.joi(entryObject, {});

    expect(error).toBeDefined();
    expect(value).toStrictEqual(expectedResult);
  });

});