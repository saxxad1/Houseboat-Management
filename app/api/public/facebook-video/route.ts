import { NextResponse } from 'next/server';
import { getEmbedUrl, getVideoExternalUrl, isFacebookVideoUrl } from '@/lib/videoUtils';

export const dynamic = 'force-dynamic';

const sourcePattern = /"(hd_src|sd_src)"\s*:\s*"((?:\\.|[^"])*)"/g;

function decodeFacebookString(value: string) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value.replace(/\\\//g, '/').replace(/\\u0025/g, '%').replace(/&amp;/g, '&');
  }
}

function extractVideoSource(html: string) {
  const sources = Array.from(html.matchAll(sourcePattern)).map((match) => ({
    quality: match[1],
    src: decodeFacebookString(match[2]),
  }));
  return sources.find((source) => source.quality === 'hd_src')?.src || sources.find((source) => source.quality === 'sd_src')?.src || '';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url')?.trim() || '';

  if (!isFacebookVideoUrl(url)) {
    return NextResponse.json({ error: 'A valid Facebook video URL is required' }, { status: 400 });
  }

  const embedUrl = getEmbedUrl(url);
  const externalUrl = getVideoExternalUrl(url);

  try {
    const response = await fetch(embedUrl, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 Chrome Safari',
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Facebook video could not be loaded', externalUrl }, { status: 502 });
    }

    const html = await response.text();
    const src = extractVideoSource(html);

    if (!src) {
      return NextResponse.json({ error: 'Facebook video source was not found', externalUrl }, { status: 404 });
    }

    return NextResponse.json(
      { src, externalUrl },
      {
        headers: {
          'Cache-Control': 'public, max-age=900, stale-while-revalidate=1800',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Facebook video could not be loaded', externalUrl }, { status: 502 });
  }
}
