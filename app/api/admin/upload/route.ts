import { NextRequest, NextResponse } from 'next/server';
import { getVerifiedAdminContext } from '@/lib/admin/serverAuth';

const bucketName = 'houseboat-media';

function safeFolder(value: FormDataEntryValue | null) {
  const folder = typeof value === 'string' ? value : 'uploads';
  return folder.replace(/[^a-z0-9-_]/gi, '-').toLowerCase() || 'uploads';
}

export async function POST(request: NextRequest) {
  const admin = await getVerifiedAdminContext(request);
  if (admin.error) return admin.error;

  const formData = await request.formData();
  const file = formData.get('file');
  const folder = safeFolder(formData.get('folder'));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const extension = file.name.split('.').pop() || 'bin';
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
