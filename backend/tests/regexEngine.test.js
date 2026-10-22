const { compileRegex, testString, testMultipleStrings, breakdownPattern } = require('../src/services/regexEngine');

describe('RegexEngine – compileRegex', () => {
  test('compiles a valid regex successfully', () => {
    const result = compileRegex('(a|b)*abb');
    expect(result.valid).toBe(true);
    expect(result.regex).toBeInstanceOf(RegExp);
    expect(result.error).toBeNull();
  });

  test('rejects empty pattern', () => {
    const result = compileRegex('');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects invalid regex syntax', () => {
    const result = compileRegex('[abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects regex exceeding max length', () => {
    const longRegex = 'a'.repeat(600);
    const result = compileRegex(longRegex);
    expect(result.valid).toBe(false);
  });

  test('compiles regex with valid flags', () => {
    const result = compileRegex('hello', 'i');
    expect(result.valid).toBe(true);
  });
});

describe('RegexEngine – testString', () => {
  test('matches a simple literal', () => {
    const { regex } = compileRegex('cat');
    const result = testString(regex, 'I have a cat');
    expect(result.accepted).toBe(true);
    expect(result.matchedPortion).toBe('cat');
  });

  test('rejects a non-matching string', () => {
    const { regex } = compileRegex('^[0-9]+$');
    const result = testString(regex, 'abc');
    expect(result.accepted).toBe(false);
    expect(result.matchedPortion).toBeNull();
  });

  test('matches with anchors', () => {
    const { regex } = compileRegex('^hello$');
    expect(testString(regex, 'hello').accepted).toBe(true);
    expect(testString(regex, 'hello world').accepted).toBe(false);
  });

  test('accepts email pattern', () => {
    const { regex } = compileRegex('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
    expect(testString(regex, 'user@example.com').accepted).toBe(true);
    expect(testString(regex, 'invalid-email').accepted).toBe(false);
  });

  test('records match position', () => {
    const { regex } = compileRegex('cat');
    const result = testString(regex, 'I have a cat here');
    expect(result.matchStart).toBe(9);
    expect(result.matchEnd).toBe(12);
  });
});

describe('RegexEngine – testMultipleStrings', () => {
  test('tests multiple strings and returns correct results', () => {
    const result = testMultipleStrings('(a|b)*abb', '', ['aabb', 'ababb', 'abab', 'abb']);
    expect(result.valid).toBe(true);
    expect(result.results[0].accepted).toBe(true);  // aabb contains abb
    expect(result.results[2].accepted).toBe(false); // abab doesn't end with abb
    expect(result.results[3].accepted).toBe(true);  // abb matches
  });

  test('returns error for invalid regex', () => {
    const result = testMultipleStrings('[invalid', '', ['test']);
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });

  test('rejects empty test strings array', () => {
    expect(() => testMultipleStrings('abc', '', [])).toThrow();
  });

  test('handles multiple strings correctly', () => {
    const result = testMultipleStrings('^[0-9]+$', '', ['123', 'abc', '456', 'hello']);
    expect(result.results[0].accepted).toBe(true);
    expect(result.results[1].accepted).toBe(false);
    expect(result.results[2].accepted).toBe(true);
    expect(result.results[3].accepted).toBe(false);
  });
});

describe('RegexEngine – breakdownPattern', () => {
  test('breaks down a simple pattern', () => {
    const components = breakdownPattern('(a|b)*abb');
    expect(components.length).toBeGreaterThan(0);
    const types = components.map((c) => c.type);
    expect(types).toContain('group');
    expect(types).toContain('quantifier');
    expect(types).toContain('literal');
  });

  test('identifies anchors', () => {
    const components = breakdownPattern('^hello$');
    const anchors = components.filter((c) => c.type === 'anchor');
    expect(anchors.length).toBe(2);
  });

  test('identifies character class', () => {
    const components = breakdownPattern('[a-z]+');
    const classes = components.filter((c) => c.type === 'class');
    expect(classes.length).toBe(1);
  });

  test('identifies escaped sequences', () => {
    const components = breakdownPattern('\\d+');
    const escapes = components.filter((c) => c.type === 'escape');
    expect(escapes.length).toBe(1);
  });
});
