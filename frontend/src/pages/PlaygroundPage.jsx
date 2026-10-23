import { useState, useCallback, useRef, useEffect } from 'react';
import { regexService } from '../services/regexService';
import { REGEX_EXAMPLES } from '../utils/regexExamples';
import toast from 'react-hot-toast';
import PatternBreakdown from '../components/regex/PatternBreakdown';

const MAX_STRINGS = 20;

export default function PlaygroundPage() {
  const [regex, setRegex] = useState('(a|b)*abb');
  const [flags, setFlags] = useState('');
  const [testStrings, setTestStrings] = useState(['aabb', 'ababb', 'abab', 'abb', '']);
  const [results, setResults] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [regexStatus, setRegexStatus] = useState({ valid: null, error: null });
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [activePanel, setActivePanel] = useState('results');
  const validateTimerRef = useRef(null);
  const liveTimerRef = useRef(null);

  // Live regex validation
  useEffect(() => {
    if (!regex.trim()) { setRegexStatus({ valid: null, error: null }); return; }
    clearTimeout(validateTimerRef.current);
    validateTimerRef.current = setTimeout(async () => {
      try {
        const data = await regexService.validate(regex, flags);
        setRegexStatus({ valid: data.valid, error: data.error });
        if (data.valid) setBreakdown(data.breakdown || []);
      } catch { /* network */ }
    }, 350);
    return () => clearTimeout(validateTimerRef.current);
  }, [regex, flags]);

  // Live test mode
  useEffect(() => {
    if (!liveMode) return;
    clearTimeout(liveTimerRef.current);
    liveTimerRef.current = setTimeout(() => {
      const nonEmpty = testStrings.filter(Boolean);
      if (regex.trim() && nonEmpty.length > 0 && regexStatus.valid !== false) {
        runTest(false);
      }
    }, 600);
    return () => clearTimeout(liveTimerRef.current);
  }, [regex, flags, testStrings, liveMode]);

  const runTest = useCallback(async (showToast = true) => {
    if (!regex.trim()) { if (showToast) toast.error('Enter a regex first.'); return; }
    const nonEmpty = testStrings.filter(Boolean);
    if (nonEmpty.length === 0) { if (showToast) toast.error('Add at least one test string.'); return; }
    setLoading(true);
    try {
      const data = await regexService.test(regex, flags, nonEmpty, false); // don't save playground to history
      setResults(data);
      setBreakdown(data.breakdown || []);
      if (showToast) toast.success(`${data.summary.accepted}/${data.summary.total} accepted`);
    } catch (err) {
      const msg =
        err.userMessage ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        err.message ||
        'Test failed';
      if (showToast) toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [regex, flags, testStrings]);

  const addString = () => {
    if (testStrings.length < MAX_STRINGS) setTestStrings((p) => [...p, '']);
  };
  const removeString = (idx) => {
    if (testStrings.length > 1) setTestStrings((p) => p.filter((_, i) => i !== idx));
  };
  const updateString = (idx, val) => {
    setTestStrings((p) => { const u = [...p]; u[idx] = val; return u; });
  };

  const loadExample = (exId) => {
    const ex = REGEX_EXAMPLES.find((x) => x.id === exId);
    if (!ex) return;
    setRegex(ex.regex);
    setFlags(ex.flags || '');
    setTestStrings([ex.matchingExample, ex.nonMatchingExample, '']);
    setResults(null);
    toast.success(`Loaded: ${ex.title}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎮 Regex Playground</h1>
          <p className="page-subtitle">Free-form regex experimentation — test, explore, learn</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <span className="toggle" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={liveMode} onChange={(e) => setLiveMode(e.target.checked)} id="live-mode-toggle" />
              <span className="toggle-slider" />
            </span>
            Live Mode
          </label>
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
            value=""
            onChange={(e) => loadExample(e.target.value)}
            aria-label="Load example"
          >
            <option value="">Load Example…</option>
            {REGEX_EXAMPLES.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="playground-layout">
        {/* Left — Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Regex Input */}
          <div className="card">
            <div className="card-header">
              <div className="card-title"><div className="title-icon">🔍</div> Pattern</div>
              <div className={`regex-status-bar ${regexStatus.valid === true ? 'valid' : regexStatus.valid === false ? 'invalid' : 'idle'}`}
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                {regexStatus.valid === true && '✓ Valid'}
                {regexStatus.valid === false && '✗ Invalid'}
                {regexStatus.valid === null && (regex ? '…' : 'Enter regex')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '1.1rem' }}>/</span>
              <input
                id="playground-regex"
                className={`form-input regex-input ${regexStatus.valid === false ? 'error' : regexStatus.valid === true ? 'valid' : ''}`}
                style={{ flex: 1 }}
                placeholder="Pattern…"
                value={regex}
                onChange={(e) => setRegex(e.target.value)}
                spellCheck={false}
                aria-label="Regex pattern"
              />
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '1.1rem' }}>/</span>
              <input
                className="form-input flags-input"
                placeholder="flags"
                value={flags}
                onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, '').slice(0, 6))}
                aria-label="Regex flags"
              />
            </div>

            {regexStatus.valid === false && (
              <div className="regex-status-bar invalid" style={{ fontSize: '0.8rem' }}>
                ✗ {regexStatus.error}
              </div>
            )}
          </div>

          {/* Test Strings */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <div className="card-title"><div className="title-icon">📝</div> Test Strings</div>
              <button className="btn btn-ghost btn-sm" onClick={() => setTestStrings([''])}>Clear All</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {testStrings.map((str, idx) => (
                <div key={idx} className="test-string-row">
                  <span className="test-string-num">
                    {results?.results?.[idx]
                      ? (results.results[idx].accepted ? '✓' : '✗')
                      : `#${idx + 1}`}
                  </span>
                  <input
                    id={`pg-string-${idx}`}
                    className="form-input"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      borderColor: results?.results?.[idx]
                        ? (results.results[idx].accepted ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.3)')
                        : undefined,
                    }}
                    placeholder={`String ${idx + 1}…`}
                    value={str}
                    onChange={(e) => updateString(idx, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && idx === testStrings.length - 1) addString(); }}
                    aria-label={`Test string ${idx + 1}`}
                  />
                  {testStrings.length > 1 && (
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => removeString(idx)} title="Remove">✕</button>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={addString} disabled={testStrings.length >= MAX_STRINGS}>
                + Add
              </button>
              <button
                id="playground-test-btn"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => runTest(true)}
                disabled={loading || regexStatus.valid === false}
              >
                {loading ? <><div className="btn-spinner" />Testing…</> : <><span>▶</span> Test All</>}
              </button>
            </div>

            {liveMode && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--info)', background: 'var(--info-bg)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                ⚡ Live mode active — results update automatically
              </div>
            )}
          </div>
        </div>

        {/* Right — Results & Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="tabs">
            <button className={`tab-btn ${activePanel === 'results' ? 'active' : ''}`} onClick={() => setActivePanel('results')}>
              📊 Results
            </button>
            <button className={`tab-btn ${activePanel === 'breakdown' ? 'active' : ''}`} onClick={() => setActivePanel('breakdown')}>
              🔬 Breakdown
            </button>
          </div>

          {activePanel === 'results' && (
            results ? (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Summary */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="summary-bar" style={{ padding: 0, background: 'none', border: 'none' }}>
                    <div className="summary-item">
                      <span className="summary-label">Total</span>
                      <span className="summary-value total">{results.summary.total}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">✓ Accepted</span>
                      <span className="summary-value accepted">{results.summary.accepted}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">✗ Rejected</span>
                      <span className="summary-value rejected">{results.summary.rejected}</span>
                    </div>
                  </div>
                </div>

                <table className="results-table">
                  <thead>
                    <tr>
                      <th>String</th>
                      <th>Result</th>
                      <th>Matched</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.results.map((row, idx) => (
                      <tr key={idx}>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
                            {row.accepted && row.matchStart !== null ? (
                              <>
                                {row.input.slice(0, row.matchStart)}
                                <span className="matched">{row.input.slice(row.matchStart, row.matchEnd)}</span>
                                {row.input.slice(row.matchEnd)}
                              </>
                            ) : row.input}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${row.accepted ? 'badge-success' : 'badge-error'}`}>
                            {row.accepted ? '✓' : '✗'}
                          </span>
                        </td>
                        <td>
                          {row.matchedPortion
                            ? <code style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-secondary)' }}>"{row.matchedPortion}"</code>
                            : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🎮</div>
                  <div className="empty-state-title">Ready to Experiment</div>
                  <div className="empty-state-desc">Modify the pattern or strings and press Test All, or enable Live Mode.</div>
                </div>
              </div>
            )
          )}

          {activePanel === 'breakdown' && (
            <PatternBreakdown breakdown={breakdown} regex={regex} />
          )}
        </div>
      </div>
    </div>
  );
}
