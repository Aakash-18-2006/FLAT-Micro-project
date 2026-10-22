import { useState, useRef } from 'react';

const LEARN_SECTIONS = [
  {
    id: 'intro',
    title: '1. What is a Regular Expression?',
    icon: '📖',
    content: `A **regular expression** (regex or regexp) is a sequence of characters that defines a search pattern. It is a powerful tool used to match, search, find, and manipulate strings of text.

Regular expressions are used in many applications: searching in text editors, validating user input (emails, passwords, phone numbers), parsing log files, and much more.

In JavaScript (the engine used here), regex patterns are written between two slashes: \`/pattern/\`. Flags like \`i\` (case-insensitive) or \`g\` (global) can follow the closing slash.`,
    syntax: '/pattern/flags',
    examples: [
      { label: 'Regex', value: 'hello' },
      { label: 'Matches', value: '"hello world"', type: 'match' },
      { label: 'No match', value: '"goodbye"', type: 'no-match' },
    ],
  },
  {
    id: 'literals',
    title: '2. Literal Characters',
    icon: '🔤',
    content: `The simplest regex pattern is a **literal** — just a sequence of characters that matches exactly that text. For example, the pattern \`cat\` matches the substring "cat" anywhere in a string.

Literal matching is case-sensitive by default. The pattern \`Cat\` would NOT match "cat" unless you use the \`i\` flag.`,
    syntax: 'cat',
    examples: [
      { label: 'Matches', value: '"I have a cat"', type: 'match' },
      { label: 'Also matches', value: '"concatenation"', type: 'match' },
      { label: 'No match (case)', value: '"CAT"', type: 'no-match' },
    ],
  },
  {
    id: 'concatenation',
    title: '3. Concatenation',
    icon: '🔗',
    content: `**Concatenation** means placing two patterns next to each other. The combined pattern matches the first followed immediately by the second.

For example, \`ab\` means: match "a" AND then "b". It's the simplest way to build sequences in regex.`,
    syntax: 'abc',
    examples: [
      { label: 'Matches', value: '"abc"', type: 'match' },
      { label: 'No match', value: '"acb"', type: 'no-match' },
    ],
  },
  {
    id: 'alternation',
    title: '4. Alternation ( | )',
    icon: '🔀',
    content: `The **pipe symbol ( | )** represents alternation — it means "OR". The pattern \`cat|dog\` matches either "cat" or "dog".

Alternation has the lowest precedence among all regex operators. Use parentheses \`()\` to group alternatives when needed.`,
    syntax: 'cat|dog',
    examples: [
      { label: 'Matches "cat"', value: '"I love cats"', type: 'match' },
      { label: 'Matches "dog"', value: '"my dog barks"', type: 'match' },
      { label: 'No match', value: '"fish tank"', type: 'no-match' },
    ],
  },
  {
    id: 'kleene',
    title: '5. Kleene Star ( * )',
    icon: '∞',
    content: `The **Kleene star ( * )** means "zero or more occurrences" of the preceding element. The pattern \`ab*\` matches "a" followed by zero or more "b"s.

This means it matches "a", "ab", "abb", "abbb", etc.`,
    syntax: 'ab*',
    examples: [
      { label: 'Matches', value: '"a" (zero b\'s)', type: 'match' },
      { label: 'Matches', value: '"abbb"', type: 'match' },
      { label: 'No match', value: '"b"', type: 'no-match' },
    ],
  },
  {
    id: 'plus',
    title: '6. Plus Operator ( + )',
    icon: '➕',
    content: `The **plus ( + )** means "one or more occurrences" of the preceding element. It's similar to \`*\` but requires at least one match.

The pattern \`ab+\` matches "ab", "abb", "abbb" — but NOT "a" alone.`,
    syntax: 'ab+',
    examples: [
      { label: 'Matches', value: '"ab"', type: 'match' },
      { label: 'Matches', value: '"abbbb"', type: 'match' },
      { label: 'No match (need 1+ b)', value: '"a"', type: 'no-match' },
    ],
  },
  {
    id: 'optional',
    title: '7. Optional ( ? )',
    icon: '❓',
    content: `The **question mark ( ? )** means "zero or one occurrence" of the preceding element. It makes a character optional.

The pattern \`colou?r\` matches both "color" and "colour" — the "u" is optional.`,
    syntax: 'colou?r',
    examples: [
      { label: 'Matches', value: '"color" (US)', type: 'match' },
      { label: 'Matches', value: '"colour" (UK)', type: 'match' },
      { label: 'No match', value: '"colouur"', type: 'no-match' },
    ],
  },
  {
    id: 'classes',
    title: '8. Character Classes [ ]',
    icon: '🗂️',
    content: `A **character class** uses square brackets \`[]\` to match one character from a set. For example:
- \`[aeiou]\` — matches any lowercase vowel
- \`[0-9]\` — matches any digit (range)
- \`[a-zA-Z]\` — matches any letter
- \`[^0-9]\` — matches any non-digit (negation with ^)

Ranges use a hyphen \`-\` between two characters.`,
    syntax: '[a-z]',
    examples: [
      { label: 'Matches', value: '"hello" (any lowercase letter)', type: 'match' },
      { label: 'No match', value: '"123" (digits)', type: 'no-match' },
    ],
  },
  {
    id: 'groups',
    title: '9. Groups ( )',
    icon: '🎯',
    content: `**Parentheses ( )** create a capturing group. They serve two purposes:
1. **Grouping**: Apply quantifiers to a sequence. \`(ab)+\` matches "ab", "abab", "ababab"...
2. **Capturing**: The matched text can be referenced later (as \\$1, \\$2, etc.)

Non-capturing groups use \`(?:...)\` syntax if you only need grouping without capturing.`,
    syntax: '(ab)+',
    examples: [
      { label: 'Matches', value: '"ab"', type: 'match' },
      { label: 'Matches', value: '"ababab"', type: 'match' },
      { label: 'No match', value: '"aabb"', type: 'no-match' },
    ],
  },
  {
    id: 'anchors',
    title: '10. Anchors ( ^ and $ )',
    icon: '⚓',
    content: `**Anchors** don't match characters — they match positions in the string:
- \`^\` — asserts the position at the **start** of the string
- \`$\` — asserts the position at the **end** of the string

The pattern \`^hello$\` matches ONLY the string "hello" — not "say hello" or "hello world".`,
    syntax: '^hello$',
    examples: [
      { label: 'Matches', value: '"hello" (exact)', type: 'match' },
      { label: 'No match', value: '"say hello"', type: 'no-match' },
      { label: 'No match', value: '"hello world"', type: 'no-match' },
    ],
  },
  {
    id: 'quantifiers',
    title: '11. Quantifiers { }',
    icon: '🔢',
    content: `**Curly-brace quantifiers** let you specify an exact count:
- \`{n}\` — exactly n occurrences
- \`{n,}\` — n or more occurrences
- \`{n,m}\` — between n and m occurrences (inclusive)

For example, \`a{3}\` matches exactly "aaa". \`a{2,4}\` matches "aa", "aaa", or "aaaa".`,
    syntax: 'a{2,4}',
    examples: [
      { label: 'Matches', value: '"aa"', type: 'match' },
      { label: 'Matches', value: '"aaaa"', type: 'match' },
      { label: 'No match', value: '"a" (only 1)', type: 'no-match' },
    ],
  },
];

export default function LearnPage() {
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef({});

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎓 Learn Regex</h1>
          <p className="page-subtitle">A beginner-friendly guide to Regular Expressions</p>
        </div>
        <div style={{
          background: 'var(--accent-dim)',
          border: '1px solid var(--border-primary)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          fontSize: '0.8rem',
          color: 'var(--accent-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ⚠️ Focused on Regular Expressions only
        </div>
      </div>

      <div className="learn-layout">
        {/* Sidebar */}
        <aside className="learn-sidebar">
          {LEARN_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              className={`learn-nav-item ${activeSection === sec.id ? 'active' : ''}`}
              onClick={() => scrollTo(sec.id)}
              aria-current={activeSection === sec.id ? 'page' : undefined}
            >
              <span>{sec.icon}</span>
              <span style={{ fontSize: '0.82rem' }}>{sec.title.replace(/^\d+\.\s/, '')}</span>
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="learn-content">
          {LEARN_SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              ref={(el) => (sectionRefs.current[sec.id] = el)}
              className="learn-section"
            >
              <h2 className="learn-section-title">
                <span>{sec.icon}</span>
                {sec.title}
                <span className="section-badge">Regex</span>
              </h2>

              {sec.content.split('\n\n').map((para, idx) => (
                <p key={idx} dangerouslySetInnerHTML={{ __html: formatParagraph(para) }} />
              ))}

              <div className="code-block">
                Syntax: <strong>{sec.syntax}</strong>
              </div>

              {sec.examples && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Examples
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sec.examples.map((ex, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: ex.type === 'match' ? 'var(--success)' : ex.type === 'no-match' ? 'var(--error)' : 'var(--text-muted)',
                          minWidth: '80px',
                        }}>
                          {ex.label}:
                        </span>
                        <code style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.85rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: ex.type === 'match' ? 'var(--success-bg)' : ex.type === 'no-match' ? 'var(--error-bg)' : 'var(--bg-secondary)',
                          color: ex.type === 'match' ? 'var(--success)' : ex.type === 'no-match' ? 'var(--error)' : 'var(--text-secondary)',
                        }}>
                          {ex.value}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatParagraph(text) {
  // Bold **text**
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, `<code style="font-family:var(--font-mono);font-size:0.875em;background:var(--bg-secondary);padding:1px 5px;border-radius:3px;color:var(--accent-secondary)">$1</code>`);
}
