const http = require('http');
const app = require('../src/app');

let server;
let baseUrl;

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    done();
  });
});

afterAll((done) => {
  if (server) {
    server.close(done);
  } else {
    done();
  }
});

describe('Backend API Integration & Regression Tests', () => {
  test('GET /api/health and GET /health return 200 with status', async () => {
    const res1 = await fetch(`${baseUrl}/api/health`);
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.success).toBe(true);
    expect(data1.message).toBe('RegexMind API is running');

    const res2 = await fetch(`${baseUrl}/health`);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
  });

  test('POST /api/regex/test verifies Numbers Only pattern (^[0-9]+$)', async () => {
    const payload = {
      regex: '^[0-9]+$',
      flags: '',
      testStrings: ['12345', '007', '12a45', 'abc', ''],
    };

    const res = await fetch(`${baseUrl}/api/regex/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.results).toHaveLength(5);

    // "12345" matches
    expect(data.results[0].input).toBe('12345');
    expect(data.results[0].accepted).toBe(true);
    expect(data.results[0].matchedPortion).toBe('12345');

    // "007" matches
    expect(data.results[1].input).toBe('007');
    expect(data.results[1].accepted).toBe(true);
    expect(data.results[1].matchedPortion).toBe('007');

    // "12a45" does not match
    expect(data.results[2].input).toBe('12a45');
    expect(data.results[2].accepted).toBe(false);

    // "abc" does not match
    expect(data.results[3].input).toBe('abc');
    expect(data.results[3].accepted).toBe(false);

    // empty string "" does not match
    expect(data.results[4].input).toBe('');
    expect(data.results[4].accepted).toBe(false);

    // Summary counts
    expect(data.summary.total).toBe(5);
    expect(data.summary.accepted).toBe(2);
    expect(data.summary.rejected).toBe(3);
  });

  test('POST /regex/test also works via the non-api route prefix', async () => {
    const payload = {
      regex: '^[0-9]+$',
      flags: '',
      testStrings: ['999'],
    };

    const res = await fetch(`${baseUrl}/regex/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.results[0].accepted).toBe(true);
  });

  test('POST /api/regex/validate returns syntax breakdown', async () => {
    const res = await fetch(`${baseUrl}/api/regex/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regex: '^[0-9]+$', flags: '' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.valid).toBe(true);
    expect(Array.isArray(data.breakdown)).toBe(true);
    expect(data.breakdown.length).toBeGreaterThan(0);
  });

  test('POST /api/regex/test returns clear 400 error for invalid regex syntax', async () => {
    const res = await fetch(`${baseUrl}/api/regex/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regex: '[0-9', testStrings: ['123'] }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toBeTruthy();
    expect(data.error).toBeTruthy();
  });

  test('CORS headers allow requests from Vercel preview and production origins', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Origin: 'https://flat-micro-project.vercel.app' },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://flat-micro-project.vercel.app');
  });
});
