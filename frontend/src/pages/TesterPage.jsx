import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { regexService } from '../services/regexService';
import { REGEX_EXAMPLES } from '../utils/regexExamples';
import toast from 'react-hot-toast';
import ResultsPanel from '../components/regex/ResultsPanel';
import PatternBreakdown from '../components/regex/PatternBreakdown';

const MAX_STRINGS = 20;

export default function TesterPage() {
  const location = useLocation();

  const [regex, setRegex] = useState('');
  const [flags, setFlags] = useState('');
  const [testStrings, setTestStrings] = useState(['', '']);
  const [results, setResults] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [regexStatus, setRegexStatus] = useState({ valid: null, error: null });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('results');
  const validateTimerRef = useRef(null);

  // Check for example passed from ExamplesPage via location state or sessionStorage
  useEffect(() => {
    let exampleToLoad = location.state?.example;
    if (!exampleToLoad) {
      const stored = sessionStorage.getItem('regexmind_load_example');
      if (stored) {
        try {
          exampleToLoad = JSON.parse(stored);
          sessionStorage.removeItem('regexmind_load_example');
        } catch (_) {}
      }
    }
    if (exampleToLoad) {
      setRegex(exampleToLoad.regex || '');
      setFlags(exampleToLoad.flags || '');
      setTestStrings([
        exampleToLoad.matchingExample || '',
        exampleToLoad.nonMatchingExample || '',
        '',
      ]);
      setResults(null);
    }
  }, [location.state]);

  // Live regex validation (debounced)
  useEffect(() => {
    if (!regex.trim()) {
      setRegexStatus({ valid: null, error: null });
      setBreakdown([]);
      return;
    }
    clearTimeout(validateTimerRef.current);
    validateTimerRef.current = setTimeout(async () => {
      try {
        const data = await regexService.validate(regex, flags);
        setRegexStatus({ valid: data.valid, error: data.error });
        if (data.valid) setBreakdown(data.breakdown || []);
        else setBreakdown([]);
      } catch {
        // network error — still allow testing
        setRegexStatus({ valid: null, error: null });
      }
    }, 400);
    return () => clearTimeout(validateTimerRef.current);
  }, [regex, flags]);

  const addString = () => {
    if (testStrings.length < MAX_STRINGS) {
      setTestStrings((prev) => [...prev, '']);
    }
  };

  const removeString = (idx) => {
    if (testStrings.length > 1) {
      setTestStrings((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const updateString = (idx, val) => {
    setTestStrings((prev) => {
      const updated = [...prev];
      updated[idx] = val;
      return updated;
    });
  };

  const clearAll = () => {
    setTestStrings(['', '']);
    setResults(null);
    setBreakdown([]);
    setRegexStatus({ valid: null, error: null });
    setRegex('');
    setFlags('');
  };

  const testAll = useCallback(async () => {
    if (!regex.trim()) {
      toast.error('Please enter a regular expression first.');
      return;
    }

    // If multiple strings are present and some are empty trailing rows, filter them out;
    // but if only empty string is present, allow testing the empty string.
    let stringsToTest = testStrings;
    if (stringsToTest.length > 1) {
      const nonEmpty = stringsToTest.filter((s) => s !== '');
      if (nonEmpty.length > 0) {
        stringsToTest = nonEmpty;
      }
    }

    if (stringsToTest.length === 0) {
      toast.error('Please enter at least one test string.');
      return;
    }

    setLoading(true);
    try {
      const data = await regexService.test(regex, flags, stringsToTest);
      setResults(data);
      setBreakdown(data.breakdown || []);
      setActiveTab('results');
      
      // Save test run directly into local browser history
      regexService.saveToLocalHistory({
        regex,
        flags,
        testStrings: stringsToTest,
        results: data.results,
        summary: data.summary,
      });

      toast.success(
        `Tested ${stringsToTest.length} string(s) — ${data.summary.accepted} accepted, ${data.summary.rejected} rejected`
      );
    } catch (err) {
      const msg =
        err.userMessage ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        (Array.isArray(err.response?.data?.errors) && err.response.data.errors[0]?.msg) ||
        err.message ||
        'Failed to test regex';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [regex, flags, testStrings]);

  const loadExample = (example) => {
    setRegex(example.regex);
    setFlags(example.flags || '');
    setTestStrings([example.matchingExample, example.nonMatchingExample, '']);
    setResults(null);
    toast.success(`Loaded: ${example.title}`);
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚡ Regex Tester</h1>
          <p className="page-subtitle">Test regular expressions against real strings instantly</p>
        </div>
        <div style={{
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          fontSize: '0.8rem',
          color: 'var(--info)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span>💾</span>
          <span>Test history saved locally in your browser</span>
        </div>
      </div>

      <div className="tester-layout">
        {/* LEFT COLUMN */}
        <div className="tester-left">
          {/* Regex Input Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="title-icon">🔍</div>
                Regular Expression
              </div>
              <select
                className="form-select"
                style={{ width: 'auto', fontSize: '0.8rem', padding: '5px 10px' }}
                value=""
                onChange={(e) => {
                  const ex = REGEX_EXAMPLES.find((x) => x.id === e.target.value);
                  if (ex) loadExample(ex);
                }}
                aria-label="Load example regex"
              >
                <option value="">Load Example…</option>
                {REGEX_EXAMPLES.map((ex) => (
                  <option key={ex.id} value={ex.id}>{ex.title}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-4" style={{ alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="flex gap-2 items-center" style={{ marginBottom: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '1.2rem' }}>/</span>
                  <input
                    id="regex-input"
                    className={`form-input regex-input ${
                      regexStatus.valid === false ? 'error' : regexStatus.valid === true ? 'valid' : ''
                    }`}
                    style={{ flex: 1 }}
                    placeholder="Enter regular expression…"
                    value={regex}
                    onChange={(e) => setRegex(e.target.value)}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Regular expression input"
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '1.2rem' }}>/</span>
                  <input
                    className="form-input flags-input"
                    placeholder="flags"
                    value={flags}
                    onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, '').slice(0, 6))}
                    title="Regex flags (e.g. gi)"
                    aria-label="Regex flags"
                  />
                </div>
              </div>
            </div>

            {/* Regex Status */}
            {regex.trim() && (
              <div className={`regex-status-bar ${
                regexStatus.valid === true ? 'valid' : regexStatus.valid === false ? 'invalid' : 'idle'
              }`}>
                {regexStatus.valid === true && <><span>✓</span> Valid regular expression</>}
                {regexStatus.valid === false && (
                  <><span>✗</span> Invalid: {regexStatus.error}</>
                )}
                {regexStatus.valid === null && <><span>⏳</span> Checking…</>}
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                id="test-all-btn"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={testAll}
                disabled={loading || regexStatus.valid === false}
                aria-label="Test all strings"
              >
                {loading ? (
                  <><div className="btn-spinner" />Testing…</>
                ) : (
                  <><span>▶</span> Test All</>
                )}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={clearAll} aria-label="Clear all">
                ✕ Clear
              </button>
            </div>
          </div>

          {/* Test Strings Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <div className="title-icon">📝</div>
                Test Strings
                <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                  {testStrings.filter(Boolean).length}/{testStrings.length}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setTestStrings([''])}
                aria-label="Clear all test strings"
              >
                Clear All
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {testStrings.map((str, idx) => (
                <div key={idx} className="test-string-row">
                  <span className="test-string-num">#{idx + 1}</span>
                  <input
                    id={`test-string-${idx}`}
                    className="form-input"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}
                    placeholder={`Test string ${idx + 1}…`}
                    value={str}
                    onChange={(e) => updateString(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (idx === testStrings.length - 1) addString();
                      }
                    }}
                    aria-label={`Test string ${idx + 1}`}
                  />
                  {testStrings.length > 1 && (
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => removeString(idx)}
                      title="Remove this string"
                      aria-label={`Remove test string ${idx + 1}`}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className="btn btn-secondary btn-sm"
                onClick={addString}
                disabled={testStrings.length >= MAX_STRINGS}
                aria-label="Add test string"
              >
                + Add String
              </button>
              {testStrings.length < MAX_STRINGS && (
                <span className="text-xs text-muted" style={{ alignSelf: 'center' }}>
                  Press Enter to add another
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="tester-right">
          {/* Tabs */}
          {(results || breakdown.length > 0) && (
            <div className="tabs">
              <button
                className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
                onClick={() => setActiveTab('results')}
              >
                📊 Results {results && `(${results.summary?.total})`}
              </button>
              <button
                className={`tab-btn ${activeTab === 'breakdown' ? 'active' : ''}`}
                onClick={() => setActiveTab('breakdown')}
              >
                🔬 Pattern Breakdown
              </button>
            </div>
          )}

          {/* Results Panel */}
          {activeTab === 'results' && (
            <ResultsPanel
              results={results}
              regex={regex}
              flags={flags}
              loading={loading}
              onTestAgain={testAll}
            />
          )}

          {/* Pattern Breakdown */}
          {activeTab === 'breakdown' && (
            <PatternBreakdown breakdown={breakdown} regex={regex} />
          )}

          {/* Empty state */}
          {!results && breakdown.length === 0 && !loading && (
            <div className="card">
              <div className="empty-state">
                <div className="empty-state-icon">🔬</div>
                <div className="empty-state-title">Ready to Test</div>
                <div className="empty-state-desc">
                  Enter a regular expression and test strings, then click <strong>Test All</strong>.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
