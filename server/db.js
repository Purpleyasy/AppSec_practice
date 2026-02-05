import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vaultsync.db');

function nowIso() {
  return new Date().toISOString();
}

function guessContentType(title) {
  const lower = title.toLowerCase();
  if (lower.endsWith('.md')) return 'text/markdown';
  if (lower.endsWith('.txt')) return 'text/plain';
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.xlsx')) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (lower.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.pbix')) return 'application/octet-stream';
  return 'application/octet-stream';
}

function seedDatabase(db) {
  const createdAt = nowIso();

  const customers = [
    { customerId: 'ACC-100', displayName: 'Chum Bucket', logoUrl: '/assets/logos/chum.svg' },
    { customerId: 'ACC-101', displayName: 'Krusty Krab', logoUrl: '/assets/logos/krusty.svg' },
    { customerId: 'ACC-102', displayName: 'McDonalds', logoUrl: '/assets/logos/mcd.svg' },
    { customerId: 'ACC-103', displayName: 'KFC', logoUrl: '/assets/logos/kfc.svg' },
    { customerId: 'ACC-104', displayName: "Gino's", logoUrl: '/assets/logos/ginos.svg' },
  ];

  const insertCustomer = db.prepare(`
    INSERT INTO customers (customer_id, display_name, logo_url, created_at)
    VALUES (?, ?, ?, ?)
  `);

  customers.forEach((customer) => {
    insertCustomer.run(customer.customerId, customer.displayName, customer.logoUrl, createdAt);
  });

  const users = [
    { username: 'plankton', password: 'plankton123', role: 'owner', customerId: 'ACC-100' },
    { username: 'mrkrabs', password: 'mrkrabs123', role: 'owner', customerId: 'ACC-101' },
    { username: 'ronald', password: 'ronald123', role: 'owner', customerId: 'ACC-102' },
    { username: 'colonel', password: 'colonel123', role: 'owner', customerId: 'ACC-103' },
    { username: 'gino', password: 'gino123', role: 'owner', customerId: 'ACC-104' },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password, role, customer_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  users.forEach((user) => {
    insertUser.run(
      randomUUID(),
      user.username,
      user.password,
      user.role,
      user.customerId,
      createdAt,
    );
  });

  const documents = [
    {
      customerId: 'ACC-100',
      title: 'chum_bucket_formula.txt',
      content: 'CHUM BUCKET FORMULA (CONFIDENTIAL)\n\nIngredient list:\n- Chum\n- Chum\n- More chum\n\nNote: The secret ingredient is not actually a secret.',
    },
    {
      customerId: 'ACC-100',
      title: 'plankton_lab_notes.md',
      content: '# Plankton Lab Notes\n\n- Prototype A failed\n- Prototype B failed\n- Try again tomorrow',
    },
    {
      customerId: 'ACC-101',
      title: 'krabby_patty_formula.md',
      content: '# Krabby Patty Formula\n\nIngredients:\n- Bun\n- Patty\n- Pickles\n- Onions\n- Lettuce\n- Cheese\n- Tomato\n- Secret Sauce',
    },
    {
      customerId: 'ACC-101',
      title: 'kelp_shake_recipe.txt',
      content: 'Kelp Shake Recipe\n\nBlend kelp, ice, sugar, and milk until smooth.',
    },
    {
      customerId: 'ACC-102',
      title: 'big_mac_sauce.xlsx',
      content: 'BINARY_PLACEHOLDER_BIG_MAC_SAUCE',
    },
    {
      customerId: 'ACC-102',
      title: 'happy_meal_toy_list.csv',
      content: 'toy,month\nRace Car,Jan\nRobot,Feb\nDinosaur,Mar',
    },
    {
      customerId: 'ACC-103',
      title: 'kfc_11_spices.pdf',
      content: 'BINARY_PLACEHOLDER_KFC_11_SPICES',
    },
    {
      customerId: 'ACC-103',
      title: 'colonel_notes.txt',
      content: 'Keep the blend locked. Rotate inventory weekly.',
    },
    {
      customerId: 'ACC-104',
      title: 'carbonara_recipe.docx',
      content: 'BINARY_PLACEHOLDER_CARBONARA',
    },
    {
      customerId: 'ACC-104',
      title: 'ginos_gravy.md',
      content: "# Gino's Gravy\n\nSlow simmer tomatoes, garlic, and basil for 4 hours.",
    },
  ];

  const insertDocument = db.prepare(`
    INSERT INTO documents (id, customer_id, title, content, content_type, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  documents.forEach((doc) => {
    const timestamp = nowIso();
    // NOTE: Storing document content as TEXT for demo simplicity (insecure for real binary docs).
    insertDocument.run(
      randomUUID(),
      doc.customerId,
      doc.title,
      doc.content,
      guessContentType(doc.title),
      timestamp,
      timestamp,
    );
  });
}

export function initDatabase() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }

  const db = new Database(DB_FILE);

  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE customers (
      customer_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      logo_url TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE documents (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content BLOB,
      content_type TEXT,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE connectors (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      owner_user_id TEXT,
      type TEXT NOT NULL,
      github_owner TEXT NOT NULL,
      github_repo TEXT NOT NULL,
      github_branch TEXT NOT NULL,
      base_path TEXT NOT NULL,
      pat_encrypted_or_plain TEXT NOT NULL,
      pat_masked TEXT NOT NULL,
      last_sync_status TEXT,
      last_sync_at TEXT,
      last_sync_message TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedDatabase(db);

  return db;
}

export { DB_FILE };
