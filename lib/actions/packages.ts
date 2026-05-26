'use server';

import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getPackageSectionStatus() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return true;
  
  const { data } = await supabase
    .from('website_content')
    .select('is_active')
    .eq('section_key', 'packages')
    .maybeSingle();
    
  return data ? data.is_active : true; // Default is true
}

export async function togglePackageSectionStatus(isVisible: boolean) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) return { error: 'Supabase not configured' };
  
  const { data: existing } = await supabase
    .from('website_content')
    .select('id')
    .eq('section_key', 'packages')
    .maybeSingle();
    
  let error;
  if (existing) {
    const res = await supabase.from('website_content').update({ is_active: isVisible }).eq('id', existing.id);
    error = res.error;
  } else {
    // If it doesn't exist, we must insert title and subtitle as well, but we can leave them blank and frontend falls back
    const res = await supabase.from('website_content').insert([{ 
      section_key: 'packages', 
      is_active: isVisible,
      title: 'Tour Packages',
      subtitle: 'Choose from our carefully crafted itineraries for the perfect getaway.'
    }]);
    error = res.error;
  }
  
  if (error) return { error: error.message || JSON.stringify(error) };
  revalidatePath('/admin/resources');
  revalidatePath('/');
  return { success: true };
}
