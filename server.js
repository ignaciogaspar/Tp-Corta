const express = require('express');
const fs = require('fs');
const path = require('path');
const { generarCodigo } = require('./utils');

let Pool = null;
try {
  ({ Pool } = require('pg'));
} catch (error) {
  Pool = null;
}

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_FILE = path.join(__dirname, 'links.json');

let pool = null;

app.use(express.json());
app.use(express.static('public'));

function leerLinksArchivo() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }

  const contenido = fs.readFileSync(DB_FILE, 'utf8').trim();
  if (!contenido) {
    return [];
  }

  return JSON.parse(contenido);
}

function guardarLinksArchivo(links) {
  fs.writeFileSync(DB_FILE, JSON.stringify(links, null, 2));
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return pool;
}

async function initializeStorage() {
  const databasePool = getPool();
  if (!databasePool) {
    return;
  }

  await databasePool.query(`
    CREATE TABLE IF NOT EXISTS links (
      codigo TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      clicks INTEGER NOT NULL DEFAULT 0,
      creado TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function leerLinks() {
  const databasePool = getPool();

  if (databasePool) {
    const result = await databasePool.query(
      'SELECT codigo, url, clicks, creado FROM links ORDER BY creado ASC'
    );

    return result.rows.map((row) => ({
      codigo: row.codigo,
      url: row.url,
      clicks: Number(row.clicks),
      creado: row.creado
    }));
  }

  return leerLinksArchivo();
}

async function guardarLink(nuevoLink) {
  const databasePool = getPool();

  if (databasePool) {
    await databasePool.query(
      'INSERT INTO links (codigo, url, clicks, creado) VALUES ($1, $2, $3, $4)',
      [nuevoLink.codigo, nuevoLink.url, nuevoLink.clicks, nuevoLink.creado]
    );
    return;
  }

  const links = leerLinksArchivo();
  links.push(nuevoLink);
  guardarLinksArchivo(links);
}

async function getLinkByCodigo(codigo) {
  const databasePool = getPool();

  if (databasePool) {
    const result = await databasePool.query(
      'SELECT codigo, url, clicks, creado FROM links WHERE codigo = $1',
      [codigo]
    );

    const row = result.rows[0];
    return row ? {
      codigo: row.codigo,
      url: row.url,
      clicks: Number(row.clicks),
      creado: row.creado
    } : null;
  }

  const links = leerLinksArchivo();
  return links.find((link) => link.codigo === codigo) || null;
}

async function actualizarClick(codigo) {
  const databasePool = getPool();

  if (databasePool) {
    await databasePool.query(
      'UPDATE links SET clicks = clicks + 1 WHERE codigo = $1',
      [codigo]
    );
    return;
  }

  const links = leerLinksArchivo();
  const link = links.find((item) => item.codigo === codigo);
  if (!link) {
    return;
  }

  link.clicks += 1;
  guardarLinksArchivo(links);
}

async function generarCodigoUnico() {
  const links = await leerLinks();

  let codigo = generarCodigo();
  let intentos = 0;

  while (links.some((link) => link.codigo === codigo) && intentos < 20) {
    codigo = generarCodigo();
    intentos += 1;
  }

  if (links.some((link) => link.codigo === codigo)) {
    throw new Error('No se pudo generar un código único');
  }

  return codigo;
}

function validarUrl(url) {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch (error) {
    return null;
  }
}

app.post('/api/links', async (req, res) => {
  const rawUrl = req.body && req.body.url;
  const url = validarUrl(rawUrl);

  if (!url) {
    return res.status(400).json({ error: 'URL inválida' });
  }

  try {
    const codigo = await generarCodigoUnico();
    const nuevo = {
      codigo,
      url,
      clicks: 0,
      creado: new Date().toISOString()
    };

    await guardarLink(nuevo);
    return res.status(201).json({ codigo, corta: `/${codigo}` });
  } catch (error) {
    return res.status(500).json({ error: 'No se pudo crear el link corto' });
  }
});

app.get('/api/links/:codigo/stats', async (req, res) => {
  const link = await getLinkByCodigo(req.params.codigo);

  if (!link) {
    return res.status(404).json({ error: 'Link no encontrado' });
  }

  return res.json({
    codigo: link.codigo,
    url: link.url,
    clicks: link.clicks,
    creado: link.creado
  });
});

app.get('/:codigo', async (req, res) => {
  const codigo = req.params.codigo;
  const link = await getLinkByCodigo(codigo);

  if (!link) {
    return res.status(404).send('No existe ese link');
  }

  await actualizarClick(codigo);
  return res.redirect(302, link.url);
});

async function startServer() {
  await initializeStorage();
  app.listen(PORT, () => {
    console.log(`Corta escuchando en http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Error al iniciar Corta:', error);
    process.exit(1);
  });
}

module.exports = { app, startServer };
