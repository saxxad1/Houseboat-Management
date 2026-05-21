import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function uploadHouseboatFile(bucket: string, folder: string, file: File) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return URL.createObjectURL(file);
  }

  const extension = file.name.split('.').pop() || 'bin';
  const safeName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(safeName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(safeName);
  return data.publicUrl;
}
