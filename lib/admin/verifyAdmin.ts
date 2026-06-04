'use client';

type AdminAccessCheck = {
  isAdmin: boolean;
  profile?: { role?: string | null } | null;
  error?: string;
};

export async function verifyAdminAccess(accessToken?: string | null): Promise<AdminAccessCheck> {
  if (!accessToken) {
    return { isAdmin: false, profile: null, error: 'Missing session token' };
  }

  try {
    const response = await fetch('/api/admin/verify', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    });
    const result = await response.json();
    return {
      isAdmin: Boolean(result.isAdmin),
      profile: result.profile || null,
      error: typeof result.error === 'string' ? result.error : '',
    };
  } catch (error) {
    return {
      isAdmin: false,
      profile: null,
      error: error instanceof Error ? error.message : 'Admin verification failed',
    };
  }
}
