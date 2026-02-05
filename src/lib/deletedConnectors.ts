// WARNING: demo UX only — soft delete persisted in sessionStorage
// CHANGEABLE: storage key format

const STORAGE_KEY_PREFIX = 'deletedConnectorIds:';

export function getDeletedConnectorIds(customerId: string): string[] {
  const key = `${STORAGE_KEY_PREFIX}${customerId}`;
  const stored = sessionStorage.getItem(key);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function addDeletedConnectorId(customerId: string, connectorId: string): void {
  const key = `${STORAGE_KEY_PREFIX}${customerId}`;
  const current = getDeletedConnectorIds(customerId);
  
  if (!current.includes(connectorId)) {
    current.push(connectorId);
    sessionStorage.setItem(key, JSON.stringify(current));
  }
}

export function clearDeletedConnectorIds(customerId: string): void {
  const key = `${STORAGE_KEY_PREFIX}${customerId}`;
  sessionStorage.removeItem(key);
}
