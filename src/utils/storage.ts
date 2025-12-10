/**
 * Secure storage utilities for tokens and user data
 * Provides abstraction over localStorage/sessionStorage with automatic cleanup
 */

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_EMAIL_KEY = 'userEmail';
const USER_NOMBRE_KEY = 'userNombre';
const USER_ROL_KEY = 'userRol';
const REMEMBER_ME_KEY = 'rememberMe';

/**
 * Determines which storage to use based on rememberMe preference
 */
function getStorage(): Storage {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  return rememberMe ? localStorage : sessionStorage;
}

/**
 * Sets the remember me preference
 */
export function setRememberMe(remember: boolean): void {
  if (remember) {
    localStorage.setItem(REMEMBER_ME_KEY, 'true');
  } else {
    localStorage.removeItem(REMEMBER_ME_KEY);
    // If switching from remember to not remember, move tokens to sessionStorage
    const token = localStorage.getItem(TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userEmail = localStorage.getItem(USER_EMAIL_KEY);
    const userNombre = localStorage.getItem(USER_NOMBRE_KEY);
    const userRol = localStorage.getItem(USER_ROL_KEY);
    
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(TOKEN_KEY);
    }
    if (refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    if (userEmail) {
      sessionStorage.setItem(USER_EMAIL_KEY, userEmail);
      localStorage.removeItem(USER_EMAIL_KEY);
    }
    if (userNombre) {
      sessionStorage.setItem(USER_NOMBRE_KEY, userNombre);
      localStorage.removeItem(USER_NOMBRE_KEY);
    }
    if (userRol) {
      sessionStorage.setItem(USER_ROL_KEY, userRol);
      localStorage.removeItem(USER_ROL_KEY);
    }
  }
}

/**
 * Gets the remember me preference
 */
export function getRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

/**
 * Stores authentication tokens
 */
export function setTokens(token: string, refreshToken: string): void {
  const storage = getStorage();
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Gets the authentication token
 */
export function getToken(): string | null {
  // Check both storages (for backward compatibility)
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Gets the refresh token
 */
export function getRefreshToken(): string | null {
  // Check both storages (for backward compatibility)
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Stores user information
 */
export function setUserInfo(email: string, nombre: string, rol: string): void {
  const storage = getStorage();
  storage.setItem(USER_EMAIL_KEY, email);
  storage.setItem(USER_NOMBRE_KEY, nombre);
  storage.setItem(USER_ROL_KEY, rol);
}

/**
 * Gets user email
 */
export function getUserEmail(): string | null {
  return localStorage.getItem(USER_EMAIL_KEY) || sessionStorage.getItem(USER_EMAIL_KEY);
}

/**
 * Gets user nombre
 */
export function getUserNombre(): string | null {
  return localStorage.getItem(USER_NOMBRE_KEY) || sessionStorage.getItem(USER_NOMBRE_KEY);
}

/**
 * Gets user rol
 */
export function getUserRol(): string | null {
  return localStorage.getItem(USER_ROL_KEY) || sessionStorage.getItem(USER_ROL_KEY);
}

/**
 * Clears all authentication data from both storages
 */
export function clearAuthData(): void {
  // Clear from localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_EMAIL_KEY);
  localStorage.removeItem(USER_NOMBRE_KEY);
  localStorage.removeItem(USER_ROL_KEY);
  
  // Clear from sessionStorage
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(USER_EMAIL_KEY);
  sessionStorage.removeItem(USER_NOMBRE_KEY);
  sessionStorage.removeItem(USER_ROL_KEY);
}

/**
 * Cleans up expired tokens from storage
 */
export function cleanupExpiredTokens(): void {
  const token = getToken();
  if (token) {
    try {
      // Simple check - if token is malformed, remove it
      const parts = token.split('.');
      if (parts.length !== 3) {
        clearAuthData();
        return;
      }
      
      // Decode and check expiration
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        clearAuthData();
      }
    } catch (error) {
      // If we can't decode the token, it's invalid - remove it
      clearAuthData();
    }
  }
}

