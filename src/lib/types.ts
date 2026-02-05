export interface Customer {
  customerId: string;
  displayName: string;
  logoUrl?: string;
}

export interface DocumentSummary {
  id: string;
  title: string;
  updatedAt: string;
  createdAt?: string;
  lastModified?: string;
  lastAccessed?: string;
  modifiedBy?: string;
  size?: number;
}

export interface DocumentDetail extends DocumentSummary {
  customerId: string;
  content: string;
}

export interface Connector {
  id: string;
  name?: string;
  type: string;
  owner: string;
  repo: string;
  repoName?: string;
  branch: string;
  basePath: string;
  patMasked: string;
  lastSyncStatus?: 'success' | 'failed' | 'syncing';
  lastSyncAt?: string;
  lastSyncMessage?: string;
}
