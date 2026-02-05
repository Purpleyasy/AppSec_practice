import express from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { initDatabase } from './db.js';
import { getNextRunFolder, joinPath, upsertFile } from './github.js';

const app = express();
app.use(express.json({ limit: '25mb' }));

const db = initDatabase();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_ISSUER = process.env.JWT_ISSUER || 'vaultsync';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'vaultsync-app';

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    const requiredClaims = [
      'sub',
      'username',
      'role',
      'customerId',
      'iat',
      'exp',
      'iss',
      'aud',
    ];

    for (const claim of requiredClaims) {
      if (payload[claim] === undefined) {
        return res.status(401).json({ error: 'Invalid token claims' });
      }
    }

    // WARNING: Claims are intentionally NOT enforced for authorization in this demo.
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function toContentString(value) {
  if (value === null || value === undefined) return '';
  if (Buffer.isBuffer(value)) return value.toString('utf8');
  return String(value);
}

function contentSize(value) {
  if (value === null || value === undefined) return 0;
  if (Buffer.isBuffer(value)) return value.length;
  return Buffer.byteLength(String(value), 'utf8');
}

function mapDocument(row) {
  return {
    id: row.id,
    title: row.title,
    name: row.title,
    customerId: row.customer_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastModified: row.updated_at,
    lastAccessed: row.updated_at,
    size: contentSize(row.content),
    modifiedBy: 'System',
    contentType: row.content_type,
    content: toContentString(row.content),
  };
}

function maskPat(pat) {
  if (!pat) return '********';
  if (pat.length <= 8) return '********';
  return `${pat.slice(0, 4)}****${pat.slice(-4)}`;
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // WARNING: Plaintext password storage is intentionally insecure for demo purposes.
  const user = db
    .prepare('SELECT * FROM users WHERE username = ? AND password = ?')
    .get(username, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role,
      customerId: user.customer_id,
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    },
  );

  return res.json({
    token,
    username: user.username,
    customerId: user.customer_id,
  });
});

app.use('/api', requireAuth);

app.get('/api/customers/:customerId', (req, res) => {
  const { customerId } = req.params;

  // WARNING: intentionally insecure for demo purposes (BOLA)
  // We trust customerId from the URL and do not enforce tenant binding.
  const customer = db
    .prepare(
      'SELECT customer_id as customerId, display_name as displayName, logo_url as logoUrl FROM customers WHERE customer_id = ?',
    )
    .get(customerId);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json(customer);
});

app.get('/api/customers/:customerId/documents', (req, res) => {
  const { customerId } = req.params;

  // WARNING: intentionally insecure for demo purposes (BOLA)
  // We trust customerId from the URL and do not enforce tenant binding.
  const rows = db
    .prepare('SELECT * FROM documents WHERE customer_id = ? ORDER BY updated_at DESC')
    .all(customerId);

  const documents = rows.map((row) => {
    const doc = mapDocument(row);
    delete doc.content;
    return doc;
  });

  return res.json({ documents });
});

app.get('/api/customers/:customerId/documents/:docId', (req, res) => {
  const { customerId, docId } = req.params;

  // WARNING: intentionally insecure for demo purposes (BOLA)
  // We trust customerId from the URL and do not enforce tenant binding.
  const row = db
    .prepare('SELECT * FROM documents WHERE id = ? AND customer_id = ?')
    .get(docId, customerId);

  if (!row) {
    return res.status(404).json({ error: 'Document not found' });
  }

  return res.json(mapDocument(row));
});

app.post('/api/customers/:customerId/documents', (req, res) => {
  const { customerId } = req.params;
  const { title, name, content } = req.body || {};
  const documentTitle = title || name;

  if (!documentTitle || content === undefined) {
    return res.status(400).json({ error: 'Title and content required' });
  }

  const id = randomUUID();
  const timestamp = new Date().toISOString();

  // NOTE: Storing document content as TEXT for demo simplicity (insecure for real binary docs).
  db.prepare(
    `INSERT INTO documents (id, customer_id, title, content, content_type, updated_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    customerId,
    documentTitle,
    content,
    'text/plain',
    timestamp,
    timestamp,
  );

  const row = db.prepare('SELECT * FROM documents WHERE id = ?').get(id);

  return res.status(201).json(mapDocument(row));
});

app.get('/api/customers/:customerId/connectors', (req, res) => {
  const { customerId } = req.params;

  // WARNING: intentionally insecure for demo purposes (BOLA)
  // We trust customerId from the URL and do not enforce tenant binding.
  const rows = db
    .prepare('SELECT * FROM connectors WHERE customer_id = ? ORDER BY created_at DESC')
    .all(customerId);

  const connectors = rows.map((row) => ({
    id: row.id,
    name: `${row.github_owner}/${row.github_repo}`,
    type: row.type,
    owner: row.github_owner,
    repo: row.github_repo,
    repoName: `${row.github_owner}/${row.github_repo}`,
    branch: row.github_branch,
    basePath: row.base_path,
    patMasked: row.pat_masked,
    lastSyncStatus: row.last_sync_status,
    lastSyncAt: row.last_sync_at,
    lastSyncMessage: row.last_sync_message,
  }));

  return res.json(connectors);
});

app.post('/api/customers/:customerId/connectors', (req, res) => {
  const { customerId } = req.params;
  const { type, owner, repo, branch, basePath, pat } = req.body || {};

  if (type !== 'github') {
    return res.status(400).json({ error: 'Only github connectors are supported' });
  }

  if (!owner || !repo || !pat) {
    return res.status(400).json({ error: 'Owner, repo, and PAT are required' });
  }

  const id = randomUUID();
  const timestamp = new Date().toISOString();
  const connectorBranch = branch || 'main';
  const connectorBasePath = basePath || 'vaultsync';

  // WARNING: Storing PAT in plaintext is intentionally insecure for demo purposes.
  const patMasked = maskPat(pat);

  db.prepare(
    `INSERT INTO connectors (
      id,
      customer_id,
      owner_user_id,
      type,
      github_owner,
      github_repo,
      github_branch,
      base_path,
      pat_encrypted_or_plain,
      pat_masked,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    customerId,
    req.user?.sub || null,
    type,
    owner,
    repo,
    connectorBranch,
    connectorBasePath,
    pat,
    patMasked,
    timestamp,
  );

  return res.status(201).json({
    id,
    name: `${owner}/${repo}`,
    type,
    owner,
    repo,
    repoName: `${owner}/${repo}`,
    branch: connectorBranch,
    basePath: connectorBasePath,
    patMasked,
    lastSyncStatus: null,
    lastSyncAt: null,
    lastSyncMessage: null,
  });
});

app.post('/api/customers/:customerId/connectors/:connectorId/sync', async (req, res) => {
  const { customerId, connectorId } = req.params;

  // WARNING: intentionally insecure for demo purposes (BOLA)
  // We trust customerId from the URL and do not enforce tenant binding.
  //
  // FIX (not enabled in demo):
  // if (req.user.customerId !== req.params.customerId) return res.status(403).json({ status: 'failed', message: 'Forbidden' });

  // FIX (not enabled in demo):
  // if (connector.owner_user_id !== req.user.sub) return res.status(403).json({ status: 'failed', message: 'Forbidden' });

  console.log('[sync] started');
  console.log(`[sync] customerId=${customerId}`);
  console.log(`[sync] connectorId=${connectorId}`);

  try {
    const connector = db
      .prepare('SELECT * FROM connectors WHERE id = ?')
      .get(connectorId);

    if (!connector) {
      db.prepare(
        'UPDATE connectors SET last_sync_status = ?, last_sync_at = ?, last_sync_message = ? WHERE id = ?',
      ).run('failed', new Date().toISOString(), 'Connector not found', connectorId);

      return res.status(200).json({ status: 'failed', message: 'Connector not found' });
    }

    const documents = db
      .prepare('SELECT * FROM documents WHERE customer_id = ?')
      .all(customerId);

    console.log(`[sync] documents=${documents.length}`);

    const runFolder = await getNextRunFolder({
      owner: connector.github_owner,
      repo: connector.github_repo,
      basePath: connector.base_path,
      connectorId,
      branch: connector.github_branch,
      token: connector.pat_encrypted_or_plain,
    });

    for (const doc of documents) {
      const filePath = joinPath(runFolder, doc.title);
      const contentBuffer = Buffer.isBuffer(doc.content)
        ? doc.content
        : Buffer.from(toContentString(doc.content), 'utf8');
      const contentBase64 = contentBuffer.toString('base64');

      console.log(`[sync] writing ${filePath}`);

      await upsertFile({
        owner: connector.github_owner,
        repo: connector.github_repo,
        branch: connector.github_branch,
        path: filePath,
        token: connector.pat_encrypted_or_plain,
        contentBase64,
        message: `VaultSync sync: ${doc.title}`,
      });
    }

    const successMessage = `Synced ${documents.length} documents to ${runFolder}/`;

    db.prepare(
      'UPDATE connectors SET last_sync_status = ?, last_sync_at = ?, last_sync_message = ? WHERE id = ?',
    ).run('success', new Date().toISOString(), successMessage, connectorId);

    return res.status(200).json({ status: 'success', message: successMessage });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sync failed';

    db.prepare(
      'UPDATE connectors SET last_sync_status = ?, last_sync_at = ?, last_sync_message = ? WHERE id = ?',
    ).run('failed', new Date().toISOString(), message, connectorId);

    return res.status(200).json({ status: 'failed', message });
  }
});

const distDir = path.resolve(process.cwd(), 'dist');
const indexFile = path.join(distDir, 'index.html');

app.use(express.static(distDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (!fs.existsSync(indexFile)) {
    return res.status(404).send('Frontend build not found. Run npm run build.');
  }
  return res.sendFile(indexFile);
});

app.listen(PORT, () => {
  console.log(`VaultSync listening on port ${PORT}`);
});
