const { testMultipleStrings } = require('../src/services/regexEngine');

// 14 presets defined in frontend/src/utils/regexExamples.js
const REGEX_PRESETS = [
  {
    id: 'only-numbers',
    title: 'Only Numbers',
    regex: '^[0-9]+$',
    flags: '',
    matchingExample: '12345',
    nonMatchingExample: 'abc123',
  },
  {
    id: 'lowercase-letters',
    title: 'Lowercase Letters',
    regex: '^[a-z]+$',
    flags: '',
    matchingExample: 'hello',
    nonMatchingExample: 'Hello',
  },
  {
    id: 'uppercase-letters',
    title: 'Uppercase Letters',
    regex: '^[A-Z]+$',
    flags: '',
    matchingExample: 'WORLD',
    nonMatchingExample: 'World',
  },
  {
    id: 'alphanumeric',
    title: 'Alphanumeric',
    regex: '^[a-zA-Z0-9]+$',
    flags: '',
    matchingExample: 'Hello123',
    nonMatchingExample: 'hello world!',
  },
  {
    id: 'email',
    title: 'Email Address',
    regex: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
    flags: '',
    matchingExample: 'user@example.com',
    nonMatchingExample: 'invalid-email',
  },
  {
    id: 'phone-number',
    title: 'Phone Number (US)',
    regex: '^\\+?1?[\\s\\-]?\\(?\\d{3}\\)?[\\s\\-]?\\d{3}[\\s\\-]?\\d{4}$',
    flags: '',
    matchingExample: '(555) 123-4567',
    nonMatchingExample: '12345',
  },
  {
    id: 'strong-password',
    title: 'Strong Password',
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    flags: '',
    matchingExample: 'MyP@ss1word',
    nonMatchingExample: 'password123',
  },
  {
    id: 'starts-with',
    title: 'Starts With "http"',
    regex: '^https?://',
    flags: '',
    matchingExample: 'https://example.com',
    nonMatchingExample: 'ftp://example.com',
  },
  {
    id: 'ends-with',
    title: 'Ends With ".pdf"',
    regex: '\\.pdf$',
    flags: 'i',
    matchingExample: 'document.PDF',
    nonMatchingExample: 'document.docx',
  },
  {
    id: 'contains-word',
    title: 'Contains "error"',
    regex: '\\berror\\b',
    flags: 'i',
    matchingExample: 'An error occurred',
    nonMatchingExample: 'The erroneous output',
  },
  {
    id: 'date-format',
    title: 'Date (YYYY-MM-DD)',
    regex: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    flags: '',
    matchingExample: '2024-03-15',
    nonMatchingExample: '2024-13-01',
  },
  {
    id: 'hex-color',
    title: 'Hex Color Code',
    regex: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
    flags: '',
    matchingExample: '#FF5733',
    nonMatchingExample: '#GGHHII',
  },
  {
    id: 'ip-address',
    title: 'IPv4 Address',
    regex: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    flags: '',
    matchingExample: '192.168.1.1',
    nonMatchingExample: '999.999.999.999',
  },
  {
    id: 'url',
    title: 'URL',
    regex: '^(https?:\\/\\/)?(([\\da-z\\.-]+)\\.([a-z\\.]{2,6})|([\\d\\.]+))([\\/?#][\\w\\.-]*)*\\/?$',
    flags: 'i',
    matchingExample: 'https://www.example.com/path',
    nonMatchingExample: 'not a url',
  },
];

describe('Regex Presets Regression Suite', () => {
  describe('Numbers Only Pattern (^[0-9]+$)', () => {
    test('strictly validates numbers and rejects non-numeric or empty strings', () => {
      const result = testMultipleStrings('^[0-9]+$', '', ['12345', '007', '12a45', 'abc', '']);
      expect(result.valid).toBe(true);
      expect(result.results).toHaveLength(5);

      // "12345" matches
      expect(result.results[0].input).toBe('12345');
      expect(result.results[0].accepted).toBe(true);

      // "007" matches
      expect(result.results[1].input).toBe('007');
      expect(result.results[1].accepted).toBe(true);

      // "12a45" does not match
      expect(result.results[2].input).toBe('12a45');
      expect(result.results[2].accepted).toBe(false);

      // "abc" does not match
      expect(result.results[3].input).toBe('abc');
      expect(result.results[3].accepted).toBe(false);

      // Empty string does not match
      expect(result.results[4].input).toBe('');
      expect(result.results[4].accepted).toBe(false);
    });
  });

  describe('All 14 Presets Verification', () => {
    test.each(REGEX_PRESETS)(
      'preset "$title" correctly matches positive and rejects negative samples',
      ({ regex, flags, matchingExample, nonMatchingExample }) => {
        const testRes = testMultipleStrings(regex, flags, [matchingExample, nonMatchingExample]);
        expect(testRes.valid).toBe(true);
        expect(testRes.results[0].accepted).toBe(true);
        expect(testRes.results[1].accepted).toBe(false);
      }
    );
  });
});
