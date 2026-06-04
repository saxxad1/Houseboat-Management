import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { assertWritableAdmin } from '@/lib/admin/permissions';

export async function uploadHouseboatFile(bucket: string, folder: string, file: File) {
  assertWritableAdmin();
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return URL.createObjectURL(file);
  }

  const { data, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !data.session?.access_token) {
    throw new Error('Admin session expired. Please login again.');
  }

  const formData = new FormData();
  formData.append('folder', folder || bucket);
  formData.append('file', file);

  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
    },
    body: formData,
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof result.error === 'string' ? result.error : 'Upload failed');
  }

  return result.url as string;
}
