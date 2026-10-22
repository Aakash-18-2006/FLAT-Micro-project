/**
 * PatternBreakdown — shows parsed components of the regex with explanations
 */
export default function PatternBreakdown({ breakdown, regex }) {
  if (!regex || breakdown.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">🔬</div>
          <div className="empty-state-title">No Pattern Loaded</div>
          <div className="empty-state-desc">Enter a valid regex to see its breakdown.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="title-icon">🔬</div>
          Pattern Breakdown
        </div>
        <code style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--accent-secondary)',
          background: 'var(--accent-dim)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)',
        }}>
          /{regex}/
        </code>
      </div>

      {/* Full pattern with color tokens */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        fontFamily: 'var(--font-mono)',
        fontSize: '1rem',
        wordBreak: 'break-all',
        lineHeight: 2,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '2px',
      }}>
        {breakdown.map((item, idx) => (
          <span
            key={idx}
            title={item.explanation}
            style={{
              color: getTokenColor(item.type),
              borderBottom: `2px solid ${getTokenColor(item.type)}`,
              paddingBottom: '1px',
              cursor: 'help',
            }}
          >
            {item.token}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
        {[
          { type: 'literal', label: 'Literal' },
          { type: 'anchor', label: 'Anchor' },
          { type: 'quantifier', label: 'Quantifier' },
          { type: 'operator', label: 'Operator' },
          { type: 'class', label: 'Char Class' },
          { type: 'group', label: 'Group' },
          { type: 'escape', label: 'Escape' },
        ].map(({ type, label }) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}>
            <span style={{ width: '10px', height: '10px', background: getTokenColor(type), borderRadius: '50%' }} />
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Breakdown list */}
      <div className="breakdown-grid">
        {breakdown.map((item, idx) => (
          <div key={idx} className={`breakdown-item token-${item.type}`}>
            <div className="breakdown-token">{item.token}</div>
            <div className="breakdown-explanation">{item.explanation}</div>
          </div>
        ))}
      </div>

      {/* Quick Reference */}
      <div style={{ marginTop: '20px' }}>
        <div style={{
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          marginBottom: '10px',
        }}>
          Quick Reference
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {QUICK_REF.map((item) => (
            <div key={item.symbol} style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              padding: '6px 10px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
            }}>
              <code style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-secondary)',
                minWidth: '28px',
                fontWeight: 700,
              }}>{item.symbol}</code>
              <span style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTokenColor(type) {
  const map = {
    literal: '#f1f1f5',
    anchor: '#60a5fa',
    quantifier: '#a78bfa',
    operator: '#fb923c',
    class: '#34d399',
    group: '#facc15',
    escape: '#f472b6',
  };
  return map[type] || '#f1f1f5';
}

const QUICK_REF = [
  { symbol: '|', desc: 'OR / alternation' },
  { symbol: '*', desc: 'Zero or more' },
  { symbol: '+', desc: 'One or more' },
  { symbol: '?', desc: 'Zero or one' },
  { symbol: '.', desc: 'Any character' },
  { symbol: '^', desc: 'Start of string' },
  { symbol: '$', desc: 'End of string' },
  { symbol: '[]', desc: 'Character class' },
  { symbol: '()', desc: 'Capturing group' },
  { symbol: '{n}', desc: 'Exactly n times' },
  { symbol: '{n,m}', desc: 'Between n–m times' },
  { symbol: '\\d', desc: 'Any digit [0-9]' },
  { symbol: '\\w', desc: 'Word char [a-zA-Z0-9_]' },
  { symbol: '\\s', desc: 'Whitespace' },
];
