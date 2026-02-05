// Token storage utilities using sessionStorage
// IMPORTANT: Token is stored in sessionStorage (not localStorage) per security requirements

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface AuthUser {
  username: string;
  customerId: string;
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getUser(): AuthUser | null {
  const userJson = sessionStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

export function setUser(user: AuthUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
