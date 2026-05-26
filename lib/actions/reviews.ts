'use server';

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { Review } from '@/types/database';

export async function getReviews() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
  return data as Review[];
}

export async function createReview(data: Partial<Review>) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { error } = await supabase.from('reviews').insert([data]);

  if (error) return { error: error.message || JSON.stringify(error) };
  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function updateReview(id: string, data: Partial<Review>) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { error } = await supabase
    .from('reviews')
    .update(data)
    .eq('id', id);

  if (error) return { error: error.message || JSON.stringify(error) };
  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function deleteReview(id: string) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { error } = await supabase.from('reviews').delete().eq('id', id);

  if (error) return { error: error.message || JSON.stringify(error) };
  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}

export async function getReviewSectionStatus() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return true;
  
  const { data } = await supabase
    .from('website_content')
    .select('is_active')
    .eq('section_key', 'reviews_section_hidden')
    .maybeSingle();
    
  return data?.is_active ? false : true;
}

export async function toggleReviewSectionStatus(isVisible: boolean) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const isHidden = !isVisible;
  
  const { data: existing } = await supabase
    .from('website_content')
    .select('id')
    .eq('section_key', 'reviews_section_hidden')
    .maybeSingle();
    
  let error;
  if (existing) {
    const res = await supabase.from('website_content').update({ is_active: isHidden }).eq('id', existing.id);
    error = res.error;
  } else {
    const res = await supabase.from('website_content').insert([{ section_key: 'reviews_section_hidden', is_active: isHidden }]);
    error = res.error;
  }
  
  if (error) return { error: error.message || JSON.stringify(error) };
  revalidatePath('/admin/reviews');
  revalidatePath('/');
  return { success: true };
}
