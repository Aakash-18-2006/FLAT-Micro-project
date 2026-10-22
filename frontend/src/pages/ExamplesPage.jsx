import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGEX_EXAMPLES, EXAMPLE_CATEGORIES } from '../utils/regexExamples';
import toast from 'react-hot-toast';

export default function ExamplesPage() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filtered = REGEX_EXAMPLES.filter((ex) => {
    const matchCat = category === 'All' || ex.category === category;
    const matchSearch = !search
      || ex.title.toLowerCase().includes(search.toLowerCase())
      || ex.regex.toLowerCase().includes(search.toLowerCase())
      || ex.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const useExample = (example) => {
    // Store in sessionStorage so Tester can load it
    sessionStorage.setItem('regexmind_load_example', JSON.stringify(example));
    navigate('/', { state: { example } });
    toast.success(`Loaded: ${example.title}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Regex Examples</h1>
          <p className="page-subtitle">Ready-to-use regular expression patterns for common use cases</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-input-wrap" style={{ maxWidth: '320px', flex: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="form-input"
            placeholder="Search examples…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search examples"
          />
        </div>

        <div className="category-filters">
          {EXAMPLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={{ marginBottom: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Showing {filtered.length} of {REGEX_EXAMPLES.length} patterns
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No patterns found</div>
          <div className="empty-state-desc">Try adjusting your search or category filter.</div>
        </div>
      ) : (
        <div className="examples-grid">
          {filtered.map((example) => (
            <ExampleCard key={example.id} example={example} onUse={useExample} />
          ))}
        </div>
      )}
    </div>
  );
}

function ExampleCard({ example, onUse }) {
  const [copied, setCopied] = useState(false);

  const copyRegex = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(example.regex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success('Regex copied!');
  };

  return (
    <div className="example-card">
      <div className="example-card-header">
        <h3 className="example-title">{example.title}</h3>
        <span className="example-category">{example.category}</span>
      </div>

      <div style={{ position: 'relative' }}>
        <div className="example-regex">{example.regex}</div>
        {example.flags && (
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Flags: <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{example.flags}</code>
          </div>
        )}
      </div>

      <p className="example-description">{example.description}</p>

      <div className="example-samples">
        <div className="example-sample">
          <span className="sample-label">✓ Matches:</span>
          <span className="sample-value match">{example.matchingExample}</span>
        </div>
        <div className="example-sample">
          <span className="sample-label">✗ Rejects:</span>
          <span className="sample-value no-match">{example.nonMatchingExample}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <button
          className="btn btn-primary btn-sm"
          style={{ flex: 1 }}
          onClick={() => onUse(example)}
          aria-label={`Use ${example.title} regex`}
        >
          ⚡ Use This Regex
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={copyRegex}
          title="Copy regex"
          aria-label={`Copy ${example.title} regex`}
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>
    </div>
  );
}
