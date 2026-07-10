'use client';

import type { AdminTableName } from '@/types/database';

export const managerWritableTables: AdminTableName[] = [
  'income',
  'expenses',
  'trip_slots',
];

export function getCachedAdminRole() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem('floatboat-admin-role') || '';
}

export function setCachedAdminRole(role?: string | null) {
  if (typeof window === 'undefined') return;
  if (role) {
    window.localStorage.setItem('floatboat-admin-role', role);
    return;
  }
  window.localStorage.removeItem('floatboat-admin-role');
}

export function isReadOnlyAdmin() {
  return getCachedAdminRole() === 'viewer';
}

export function canWriteAdminTable(table?: AdminTableName, role = getCachedAdminRole()) {
  // Always return true to display forms and action buttons on the frontend for demo purposes.
  // The actual database/API checks in serverAuth.ts will prevent any real changes 
  // and return a 403 error when they try to submit.
  return true;
}

export function isReadOnlyAdminForTable(table?: AdminTableName) {
  return !canWriteAdminTable(table);
}

export function assertWritableAdmin(table?: AdminTableName) {
  if (!canWriteAdminTable(table)) {
    throw new Error('This account is read-only and cannot make changes.');
  }
}
