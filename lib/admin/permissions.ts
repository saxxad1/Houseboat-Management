'use client';

export function getCachedAdminRole() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('kuhelika-admin-role') || '';
}

export function setCachedAdminRole(role?: string | null) {
  if (typeof window === 'undefined') return;
  if (role) {
    window.localStorage.setItem('kuhelika-admin-role', role);
    return;
  }
  window.localStorage.removeItem('kuhelika-admin-role');
}

export function isReadOnlyAdmin() {
  return getCachedAdminRole() === 'viewer';
}

export function assertWritableAdmin() {
  if (isReadOnlyAdmin()) {
    throw new Error('This account is read-only and cannot make changes.');
  }
}
