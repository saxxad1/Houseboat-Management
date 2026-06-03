import type { Review } from '@/types/database';

type FacebookRating = {
  id?: string;
  created_time?: string;
  rating?: number;
  review_text?: string;
  reviewer_text?: string;
  recommendation_type?: string;
  reviewer?: {
    id?: string;
    name?: string;
  };
  open_graph_story?: {
    id?: string;
  };
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'FB';
}

function normalizeRating(item: FacebookRating) {
  const numericRating = Number(item.rating || 0);
  if (Number.isFinite(numericRating) && numericRating >= 1) {
    return Math.min(Math.max(Math.round(numericRating), 1), 5);
  }

  if (item.recommendation_type === 'positive') return 5;
  if (item.recommendation_type === 'negative') return 1;
  return 5;
}

function normalizeReview(item: FacebookRating, pageId: string) {
  const externalId = String(item.id || item.open_graph_story?.id || '').trim();
  const reviewText = String(item.review_text || item.reviewer_text || '').trim();
  const name = String(item.reviewer?.name || 'Facebook Guest').trim();

  if (!externalId || !reviewText) return null;

  return {
    externalId,
    data: {
      name,
      location: 'Facebook Review',
      rating: normalizeRating(item),
      review: reviewText,
      avatar: getInitials(name),
      is_published: true,
      source: 'facebook',
      external_id: externalId,
      source_url: `https://www.facebook.com/${pageId}/reviews`,
      external_created_at: item.created_time || null,
    } satisfies Partial<Review>,
  };
}

async function fetchFacebookRatings(pageId: string, pageAccessToken: string, version: string) {
  const baseUrl = `https://graph.facebook.com/${version}/${pageId}/ratings`;
  const params = new URLSearchParams({
    access_token: pageAccessToken,
    limit: '50',
    fields: 'id,created_time,rating,review_text,reviewer{id,name},recommendation_type,open_graph_story',
  });

  let response = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
  let result = await response.json().catch(() => ({}));

  if (!response.ok) {
    params.delete('fields');
    response = await fetch(`${baseUrl}?${params.toString()}`, { cache: 'no-store' });
    result = await response.json().catch(() => ({}));
  }

  if (!response.ok) {
    const message = result?.error?.message || 'Facebook reviews sync failed';
    throw new Error(message);
  }

  return Array.isArray(result.data) ? result.data as FacebookRating[] : [];
}

export async function syncFacebookReviews(db: any) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const version = process.env.FACEBOOK_GRAPH_API_VERSION || 'v24.0';

  if (!pageId || !pageAccessToken) {
    throw new Error('FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN must be set in environment variables.');
  }

  const ratings = await fetchFacebookRatings(pageId, pageAccessToken, version);
  const normalized = ratings
    .map((item) => normalizeReview(item, pageId))
    .filter(Boolean) as Array<{ externalId: string; data: Partial<Review> }>;

  if (!normalized.length) {
    return { imported: 0, updated: 0, skipped: ratings.length };
  }

  const externalIds = normalized.map((item) => item.externalId);
  const { data: existingRows, error: existingError } = await db
    .from('reviews')
    .select('id, external_id')
    .eq('source', 'facebook')
    .in('external_id', externalIds);

  if (existingError) throw existingError;

  const existingByExternalId = new Map<string, string>(
    (existingRows || []).map((row: { id: string; external_id: string }) => [row.external_id, row.id])
  );

  let imported = 0;
  let updated = 0;

  for (const item of normalized) {
    const existingId = existingByExternalId.get(item.externalId);

    if (existingId) {
      const { error } = await db
        .from('reviews')
        .update({
          ...item.data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingId);

      if (error) throw error;
      updated += 1;
    } else {
      const { error } = await db
        .from('reviews')
        .insert({
          ...item.data,
          created_at: item.data.external_created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      imported += 1;
    }
  }

  return { imported, updated, skipped: ratings.length - normalized.length };
}
