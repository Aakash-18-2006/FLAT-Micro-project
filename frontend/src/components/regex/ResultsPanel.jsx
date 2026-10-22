/**
 * ResultsPanel — displays test results with match highlighting and summary
 */
export default function ResultsPanel({ results, regex, flags, loading, onTestAgain }) {
  if (loading) {
    return (
      <div className="card">
        <div className="empty-state">
          <div style={{ fontSize: '32px', animation: 'spin 1s linear infinite' }}>⚡</div>
          <div className="empty-state-title">Testing…</div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const { results: rows, summary, regex: testedRegex, flags: testedFlags } = results;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Summary */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            /{testedRegex}/{testedFlags}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onTestAgain} aria-label="Test again">
            ↺ Test Again
          </button>
        </div>

        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-value total">{summary.total}</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <div className="summary-item">
            <span className="summary-label">✓ Accepted</span>
            <span className="summary-value accepted">{summary.accepted}</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 4px' }} />
          <div className="summary-item">
            <span className="summary-label">✗ Rejected</span>
            <span className="summary-value rejected">{summary.rejected}</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Test String</th>
              <th>Result</th>
              <th>Match</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                    {idx + 1}
                  </span>
                </td>
                <td>
                  <MatchHighlight
                    input={row.input}
                    matchStart={row.matchStart}
                    matchEnd={row.matchEnd}
                    accepted={row.accepted}
                  />
                </td>
                <td>
                  <span className={`badge ${row.accepted ? 'badge-success' : 'badge-error'}`}>
                    {row.accepted ? '✓ ACCEPTED' : '✗ REJECTED'}
                  </span>
                </td>
                <td>
                  {row.accepted && row.matchedPortion !== null ? (
                    <code style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      background: 'rgba(220,38,38,0.1)',
                      color: 'var(--accent-secondary)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}>
                      "{row.matchedPortion}"
                    </code>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>
                  )}
                </td>
                <td>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    {row.executionTimeMs}ms
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Match Highlighting detail */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="title-icon">🎯</div>
            Match Highlighting
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rows.map((row, idx) => (
            <div key={idx} style={{
              padding: '10px 14px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${row.accepted ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  String {idx + 1}
                </span>
                <span className={`badge ${row.accepted ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>
                  {row.accepted ? '✓' : '✗'}
                </span>
              </div>
              {row.accepted && row.matchStart !== null ? (
                <div className="match-highlight">
                  <span>{row.input.slice(0, row.matchStart)}</span>
                  <span className="matched">{row.input.slice(row.matchStart, row.matchEnd)}</span>
                  <span>{row.input.slice(row.matchEnd)}</span>
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {row.input || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>(empty string)</span>}
                  {!row.accepted && (
                    <span style={{ marginLeft: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      — No match found
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchHighlight({ input, matchStart, matchEnd, accepted }) {
  if (!accepted || matchStart === null) {
    return (
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', wordBreak: 'break-all' }}>
        {input}
      </span>
    );
  }

  return (
    <span className="match-highlight" style={{ fontSize: '0.875rem' }}>
      {input.slice(0, matchStart)}
      <span className="matched">{input.slice(matchStart, matchEnd)}</span>
      {input.slice(matchEnd)}
    </span>
  );
}
