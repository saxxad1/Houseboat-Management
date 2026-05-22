'use client';

export async function verifyAdminAccess(accessToken?: string | null) {
  if (!accessToken) {
    return { isAdmin: false, error: 'Missing session token' };
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
      error: typeof result.error === 'string' ? result.error : '',
    };
  } catch (error) {
    return {
      isAdmin: false,
      error: error instanceof Error ? error.message : 'Admin যাচাই করা যায়নি',
    };
  }
}
