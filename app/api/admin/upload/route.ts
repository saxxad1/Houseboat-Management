import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext } from '@/lib/admin/serverAuth';

const bucketName = 'houseboat-media';
const maxFileSize = 8 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function safeFolder(value: FormDataEntryValue | null) {
  const folder = typeof value === 'string' ? value : 'uploads';
  return folder.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'uploads';
}

export async function POST(request: NextRequest) {
  const admin = await getVerifiedAdminContext(request);
  if ('error' in admin) return admin.error;

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = safeFolder(formData.get('folder'));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: 'File must be 8MB or smaller' }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG, WebP, and GIF images are allowed' }, { status: 400 });
  }

  const extension = (file.name.split('.').pop() || 'bin').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const safeName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error } = await admin.supabase.storage.from(bucketName).upload(safeName, bytes, {
    cacheControl: '3600',
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = admin.supabase.storage.from(bucketName).getPublicUrl(safeName);
  return NextResponse.json({ url: data.publicUrl });
}
