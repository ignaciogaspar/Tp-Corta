const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../server');

async function withServer(testFn) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await testFn(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('POST /api/links crea un link corto para una URL válida', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/alpha' })
    });

    assert.equal(response.status, 201);
    const data = await response.json();
    assert.match(data.codigo, /^[a-z0-9]{3}$/);
    assert.equal(data.corta, `/${data.codigo}`);
  });
});

test('GET /:codigo redirige a la URL original y cuenta el click', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/redirect-target' })
    });
    const created = await createResponse.json();

    const redirectResponse = await fetch(`${baseUrl}/${created.codigo}`, {
      method: 'GET',
      redirect: 'manual'
    });

    assert.equal(redirectResponse.status, 302);
    assert.equal(redirectResponse.headers.get('location'), 'https://example.com/redirect-target');

    const statsResponse = await fetch(`${baseUrl}/api/links/${created.codigo}/stats`);
    const stats = await statsResponse.json();
    assert.equal(stats.clicks, 1);
  });
});

test('GET /api/links/:codigo/stats devuelve los datos reales', async () => {
  await withServer(async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com/stats-check' })
    });
    const created = await createResponse.json();

    const statsResponse = await fetch(`${baseUrl}/api/links/${created.codigo}/stats`);
    assert.equal(statsResponse.status, 200);

    const stats = await statsResponse.json();
    assert.equal(stats.codigo, created.codigo);
    assert.equal(stats.url, 'https://example.com/stats-check');
    assert.equal(stats.clicks, 0);
    assert.ok(stats.creado);
  });
});

test('POST /api/links rechaza URLs inválidas', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'javascript:alert(1)' })
    });

    assert.equal(response.status, 400);
  });
});
