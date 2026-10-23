/**
 * Regex Engine (Frontend Edition)
 * Pure JavaScript RegExp compiler, validator, execution tester, and syntax breakdown.
 * Evaluates dynamically with sub-millisecond execution timing and match index offsets.
 */

export const MAX_REGEX_LENGTH = 500;
export const MAX_STRING_LENGTH = 5000;
export const MAX_TEST_STRINGS = 50;

/**
 * Validate and compile a regex pattern safely.
 * Returns { valid, regex, error }
 */
export function compileRegex(pattern, flags = '') {
  if (pattern === undefined || pattern === null || pattern === '') {
    return { valid: false, regex: null, error: 'Regular expression cannot be empty.' };
  }

  if (pattern.length > MAX_REGEX_LENGTH) {
    return {
      valid: false,
      regex: null,
      error: `Regular expression too long. Maximum ${MAX_REGEX_LENGTH} characters.`,
    };
  }

  // Validate flags
  const validFlags = /^[gimsuy]*$/;
  if (!validFlags.test(flags)) {
    return { valid: false, regex: null, error: `Invalid regex flags: "${flags}"` };
  }

  try {
    const regex = new RegExp(pattern, flags);
    return { valid: true, regex, error: null };
  } catch (err) {
    return { valid: false, regex: null, error: err.message };
  }
}

/**
 * Execute a regex test with timing and match offset tracking.
 * Returns { accepted, matchedPortion, matchStart, matchEnd, executionTimeMs, error }
 */
export function testString(regex, input) {
  if (typeof input !== 'string') {
    input = String(input ?? '');
  }

  if (input.length > MAX_STRING_LENGTH) {
    return {
      accepted: false,
      matchedPortion: null,
      matchStart: null,
      matchEnd: null,
      executionTimeMs: 0,
      error: `Test string too long. Maximum ${MAX_STRING_LENGTH} characters.`,
    };
  }

  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  try {
    // Clone regex to reset lastIndex for global/sticky flags
    const safeFlags = regex.flags.replace('g', '').replace('y', '');
    const testRegex = new RegExp(regex.source, safeFlags);

    const match = testRegex.exec(input);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executionTimeMs = Math.max(0, Math.round(endTime - startTime));

    if (match !== null) {
      return {
        accepted: true,
        matchedPortion: match[0],
        matchStart: match.index,
        matchEnd: match.index + match[0].length,
        executionTimeMs,
        error: null,
      };
    } else {
      return {
        accepted: false,
        matchedPortion: null,
        matchStart: null,
        matchEnd: null,
        executionTimeMs,
        error: null,
      };
    }
  } catch (err) {
    return {
      accepted: false,
      matchedPortion: null,
      matchStart: null,
      matchEnd: null,
      executionTimeMs: 0,
      error: err.message,
    };
  }
}

/**
 * Test multiple strings against a regex.
 * Returns { valid, error, results }
 */
export function testMultipleStrings(pattern, flags = '', testStrings = []) {
  if (!Array.isArray(testStrings)) {
    throw new Error('testStrings must be an array');
  }
  if (testStrings.length === 0) {
    throw new Error('At least one test string is required');
  }
  if (testStrings.length > MAX_TEST_STRINGS) {
    throw new Error(`Too many test strings. Maximum ${MAX_TEST_STRINGS} allowed.`);
  }

  const { valid, regex, error } = compileRegex(pattern, flags);
  if (!valid) {
    return { valid: false, error, results: [] };
  }

  const results = testStrings.map((input) => {
    const strResult = testString(regex, input);
    return {
      input,
      accepted: strResult.accepted,
      matchedPortion: strResult.matchedPortion,
      matchStart: strResult.matchStart,
      matchEnd: strResult.matchEnd,
      executionTimeMs: strResult.executionTimeMs,
    };
  });

  return { valid: true, error: null, results };
}

/**
 * Parse and explain the major theoretical components of a regex pattern.
 * Returns array of token objects { token, explanation, type }
 */
export function breakdownPattern(pattern) {
  if (!pattern) return [];
  const components = [];

  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];

    if (ch === '\\') {
      const next = pattern[i + 1] || '';
      const escaped = '\\' + next;
      let explanation = `Escaped character: matches literal "${next}"`;

      const escapeMap = {
        d: 'Digit character class — matches any digit [0-9]',
        D: 'Non-digit character class — matches any non-digit',
        w: 'Word character class — matches [a-zA-Z0-9_]',
        W: 'Non-word character — matches anything except [a-zA-Z0-9_]',
        s: 'Whitespace — matches space, tab, newline, etc.',
        S: 'Non-whitespace character',
        b: 'Word boundary assertion',
        B: 'Non-word boundary assertion',
        n: 'Newline character',
        t: 'Tab character',
        r: 'Carriage return',
        '.': 'Literal period (dot)',
        '*': 'Literal asterisk',
        '+': 'Literal plus sign',
        '?': 'Literal question mark',
        '(': 'Literal opening parenthesis',
        ')': 'Literal closing parenthesis',
        '[': 'Literal opening bracket',
        ']': 'Literal closing bracket',
        '{': 'Literal opening brace',
        '}': 'Literal closing brace',
        '^': 'Literal caret',
        $: 'Literal dollar sign',
        '|': 'Literal pipe',
        '\\': 'Literal backslash',
      };

      if (escapeMap[next]) {
        explanation = escapeMap[next];
      }

      components.push({ token: escaped, explanation, type: 'escape' });
      i += 2;
      continue;
    }

    if (ch === '[') {
      let j = i + 1;
      let classContent = '';
      while (j < pattern.length && pattern[j] !== ']') {
        if (pattern[j] === '\\') {
          classContent += pattern[j] + (pattern[j + 1] || '');
          j += 2;
        } else {
          classContent += pattern[j];
          j++;
        }
      }
      const token = '[' + classContent + ']';
      components.push({
        token,
        explanation: `Character class — matches any one character from: ${classContent}`,
        type: 'class',
      });
      i = j + 1;
      continue;
    }

    if (ch === '(') {
      let depth = 1;
      let j = i + 1;
      let groupContent = '';
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '(' && pattern[j - 1] !== '\\') depth++;
        if (pattern[j] === ')' && pattern[j - 1] !== '\\') depth--;
        if (depth > 0) groupContent += pattern[j];
        j++;
      }
      const token = '(' + groupContent + ')';
      let explanation = `Capturing group containing: ${groupContent}`;
      if (groupContent.startsWith('?:')) {
        explanation = `Non-capturing group containing: ${groupContent.slice(2)}`;
      } else if (groupContent.startsWith('?=')) {
        explanation = `Positive lookahead: asserts that "${groupContent.slice(2)}" follows`;
      } else if (groupContent.startsWith('?!')) {
        explanation = `Negative lookahead: asserts that "${groupContent.slice(2)}" does NOT follow`;
      } else if (groupContent.includes('|')) {
        explanation = `Group with alternation (OR): ${groupContent
          .split('|')
          .map((p) => `"${p}"`)
          .join(' OR ')}`;
      }
      components.push({ token, explanation, type: 'group' });
      i = j;
      continue;
    }

    if (ch === '{') {
      let j = i + 1;
      let quantContent = '';
      while (j < pattern.length && pattern[j] !== '}') {
        quantContent += pattern[j];
        j++;
      }
      const token = '{' + quantContent + '}';
      let explanation = `Quantifier: `;
      if (/^\d+$/.test(quantContent)) {
        explanation += `exactly ${quantContent} occurrences`;
      } else if (/^\d+,$/.test(quantContent)) {
        const n = quantContent.replace(',', '');
        explanation += `${n} or more occurrences`;
      } else if (/^\d+,\d+$/.test(quantContent)) {
        const [min, max] = quantContent.split(',');
        explanation += `between ${min} and ${max} occurrences`;
      } else {
        explanation += quantContent;
      }
      components.push({ token, explanation, type: 'quantifier' });
      i = j + 1;
      continue;
    }

    const opMap = {
      '|': { explanation: 'Alternation (OR) — matches the expression before OR after this operator', type: 'operator' },
      '*': { explanation: 'Kleene star — zero or more occurrences of the preceding element', type: 'quantifier' },
      '+': { explanation: 'Plus — one or more occurrences of the preceding element', type: 'quantifier' },
      '?': { explanation: 'Optional — zero or one occurrence of the preceding element', type: 'quantifier' },
      '.': { explanation: 'Wildcard — matches any single character (except newline by default)', type: 'operator' },
      '^': { explanation: 'Start anchor — asserts position at the start of the string', type: 'anchor' },
      $: { explanation: 'End anchor — asserts position at the end of the string', type: 'anchor' },
    };

    if (opMap[ch]) {
      components.push({ token: ch, ...opMap[ch] });
    } else {
      let literal = ch;
      let j = i + 1;
      while (j < pattern.length && !'\\[](){}|*+?.^$'.includes(pattern[j])) {
        literal += pattern[j];
        j++;
      }
      components.push({
        token: literal,
        explanation: `Literal sequence — matches the exact text "${literal}"`,
        type: 'literal',
      });
      i = j;
      continue;
    }

    i++;
  }

  return components;
}
