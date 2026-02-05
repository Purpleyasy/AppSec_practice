// Mock API data for demo purposes
// This simulates backend responses without requiring a real server

export interface Document {
  id: string;
  name: string;
  customerId: string;
  createdAt: string;
  size: number;
  content?: string;
  lastModified: string;
  lastAccessed: string;
  modifiedBy?: string;
}

export interface Connector {
  id: string;
  type: string;
  customerId: string;
  repoName: string;
  createdAt: string;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'failed' | 'syncing';
  lastSyncMessage?: string;
  pat?: string;
}

export interface Customer {
  id: string;
  name: string;
  logoUrl?: string;
}

// Mock customers
const mockCustomers: Customer[] = [
  {
    id: 'krustykrab',
    name: 'Krusty Krab',
    logoUrl: '/logos/krustykrab.png',
  },
  {
    id: 'chumbucket',
    name: 'Chum Bucket',
    logoUrl: '/logos/chumbucket.png',
  },
];

// Mock document storage
const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    name: 'krabby-patty-formula.txt',
    customerId: 'krustykrab',
    createdAt: '2026-01-15T10:30:00Z',
    lastModified: '2026-02-03T14:22:00Z',
    lastAccessed: '2026-02-05T09:15:00Z',
    modifiedBy: 'SpongeBob SquarePants',
    size: 1247,
    content: 'SECRET KRABBY PATTY FORMULA\n\nIngredients:\n- 2 Buns\n- 1 Patty\n- Pickles\n- Onions\n- Lettuce\n- Cheese\n- Tomatoes\n- Ketchup\n- Mustard\n- Secret Sauce (DO NOT SHARE)\n\nThe secret ingredient is... [REDACTED]',
  },
  {
    id: 'doc-2',
    name: 'chum-recipe.txt',
    customerId: 'chumbucket',
    createdAt: '2026-01-20T14:22:00Z',
    lastModified: '2026-02-04T11:30:00Z',
    lastAccessed: '2026-02-04T16:45:00Z',
    modifiedBy: 'Plankton',
    size: 856,
    content: 'CHUM BUCKET SPECIAL RECIPE\n\nIngredients:\n- Chum\n- More chum\n- Industrial byproducts\n- Food coloring\n- Mystery ingredient X\n\nInstructions:\nMix everything together until it looks edible (it won\'t be).',
  },
  {
    id: 'doc-3',
    name: 'kelp-shake-recipe.txt',
    customerId: 'krustykrab',
    createdAt: '2026-02-01T09:15:00Z',
    lastModified: '2026-02-02T13:20:00Z',
    lastAccessed: '2026-02-05T08:00:00Z',
    modifiedBy: 'Squidward Tentacles',
    size: 634,
    content: 'KELP SHAKE RECIPE\n\nIngredients:\n- Fresh kelp\n- Ice\n- Sugar\n- Milk\n- Vanilla extract\n\nBlend until smooth. Serve cold. Warning: May cause addiction.',
  },
];

// Mock connector storage
const mockConnectors: Connector[] = [
  {
    id: 'conn-1',
    type: 'github',
    customerId: 'krustykrab',
    repoName: 'krustykrab/secret-recipes',
    createdAt: '2026-01-10T08:00:00Z',
    lastSyncAt: '2026-02-05T02:30:00Z',
    lastSyncStatus: 'success',
    lastSyncMessage: 'Synced 3 documents',
    pat: 'ghp_krusty123secrettoken456',
  },
  {
    id: 'conn-2',
    type: 'github',
    customerId: 'chumbucket',
    repoName: 'chumbucket/recipes',
    createdAt: '2026-01-25T11:45:00Z',
    lastSyncAt: '2026-02-04T18:20:00Z',
    lastSyncStatus: 'failed',
    lastSyncMessage: 'Rate limit exceeded',
    pat: 'ghp_plankton789token',
  },
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Customers
  async getCustomer(customerId: string): Promise<Customer> {
    await delay(200);
    const customer = mockCustomers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    return customer;
  },

  // Documents
  async getDocuments(customerId: string): Promise<{ documents: Document[] }> {
    await delay(300);
    const docs = mockDocuments.filter(d => d.customerId === customerId);
    return { documents: docs };
  },

  async getDocument(customerId: string, docId: string): Promise<Document> {
    await delay(200);
    const doc = mockDocuments.find(d => d.id === docId && d.customerId === customerId);
    if (!doc) throw new Error('Document not found');
    return doc;
  },

  async createDocument(customerId: string, name: string, content: string): Promise<Document> {
    await delay(400);
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name,
      customerId,
      createdAt: new Date().toISOString(),
      size: new Blob([content]).size,
      content,
      lastModified: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      modifiedBy: 'SpongeBob SquarePants',
    };
    mockDocuments.push(newDoc);
    return newDoc;
  },

  // Connectors
  async getConnectors(customerId: string): Promise<Connector[]> {
    await delay(300);
    return mockConnectors.filter(c => c.customerId === customerId);
  },

  async createConnector(customerId: string, type: string, repoName: string, pat: string): Promise<Connector> {
    await delay(500);
    const newConnector: Connector = {
      id: `conn-${Date.now()}`,
      type,
      customerId,
      repoName,
      createdAt: new Date().toISOString(),
      pat,
    };
    mockConnectors.push(newConnector);
    return newConnector;
  },

  async updateConnectorPat(customerId: string, connectorId: string, pat: string): Promise<Connector> {
    await delay(400);
    const connector = mockConnectors.find(c => c.id === connectorId && c.customerId === customerId);
    if (!connector) throw new Error('Connector not found');
    connector.pat = pat;
    return connector;
  },

  async syncConnector(customerId: string, connectorId: string): Promise<{ 
    status: 'success' | 'failed'; 
    message: string;
    timestamp: string;
  }> {
    await delay(1500);
    
    // Intentionally fail some syncs for demo purposes
    const shouldFail = Math.random() > 0.6;
    const status = shouldFail ? 'failed' : 'success';
    const message = shouldFail 
      ? 'Authentication failed: Invalid token' 
      : `Synced ${Math.floor(Math.random() * 5) + 1} documents`;
    
    const connector = mockConnectors.find(c => c.id === connectorId && c.customerId === customerId);
    if (connector) {
      connector.lastSyncAt = new Date().toISOString();
      connector.lastSyncStatus = status;
      connector.lastSyncMessage = message;
    }

    return {
      status,
      message,
      timestamp: new Date().toISOString(),
    };
  },
};