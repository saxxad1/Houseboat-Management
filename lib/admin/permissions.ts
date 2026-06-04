'use client';

import type { AdminTableName } from '@/types/database';

export const managerWritableTables: AdminTableName[] = [
  'income',
  'expenses',
  'trip_slots',
];

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

export function canWriteAdminTable(table?: AdminTableName, role = getCachedAdminRole()) {
  if (role === 'admin') return true;
  if (role === 'manager') return Boolean(table && managerWritableTables.includes(table));
  return false;
}

export function isReadOnlyAdminForTable(table?: AdminTableName) {
  return !canWriteAdminTable(table);
}

export function assertWritableAdmin(table?: AdminTableName) {
  if (!canWriteAdminTable(table)) {
    throw new Error('This account is read-only and cannot make changes.');
  }
}
