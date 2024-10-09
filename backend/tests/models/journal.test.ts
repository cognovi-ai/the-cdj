/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Journal } from "../../src/models/index.js";

describe('Journal model unit tests', () => {
  const positiveTestCases = [
    {
      desc: 'title contains valid characters',
      input: {
        title: 'This title is fine%5843./,;//""'
      },
      expected: {
        title: 'This title is fine%5843./,;//""'
      }
    },
    {
      desc: 'undefined title produces default value',
      input: {},
      expected: {
        title: 'The Cognitive Distortion Journal'
      }
    },
    {
      desc: 'title at most 100 characters',
      input: {
        title: 'g'.repeat(100)
      },
      expected: {
        title: 'g'.repeat(100)
      }
    },
    {
      desc: 'title at most 100 characters with whitespace trimmed',
      input: {
        title: 'g'.repeat(100).padStart(5, ' ').padEnd(5, ' ')
      },
      expected: {
        title: 'g'.repeat(100).padStart(5, ' ').padEnd(5, ' ')
      }
    },
  ];

  it.each(positiveTestCases)(
    'joi validation succeeds when $desc',
    ({ desc, input, expected }) => {
      const { error, value } = Journal.joi(input);

      expect(error).toBeUndefined();
      expect(value).toStrictEqual(expected);
    }
  );

  const negativeTestCases = [
    {
      desc: 'title is not a string',
      input: {
        title: 123
      },
      expected: {
        title: 123
      }
    },
    {
      desc: 'title over 100 characters',
      input: {
        title: 'g'.repeat(101)
      },
      expected: {
        title: 'g'.repeat(101)
      }
    },
    {
      desc: 'title is empty string',
      input: {
        title: ''
      },
      expected: {
        title: ''
      }
    },
    {
      desc: 'any other property except title is passed in',
      input: {
        title: 'The Cognitive Distortion Journal',
        created_at: new Date(0),
        updated_at: new Date(0)
      },
      expected: {
        title: 'The Cognitive Distortion Journal',
        created_at: new Date(0),
        updated_at: new Date(0)
      }
    },
  ];

  it.each(negativeTestCases)(
    'joi validation fails when $desc',
    ({ desc, input, expected }) => {
      const { error, value } = Journal.joi(input);

      expect(error).toBeDefined();
      expect(value).toStrictEqual(expected);
    }
  );
});