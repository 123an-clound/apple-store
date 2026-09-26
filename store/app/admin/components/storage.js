'use client';

import { getSupabaseBrowser } from '@/lib/supabase-browser';
import { slugify } from '@/lib/helpers';

export const BUCKET = 'anh-iphone';
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/avif': 'avif' };

// Uploads straight from the browser with the admin's session (RLS checks the
// editor role on storage.objects). Returns the object name stored in the
// "Hình ảnh sản phẩm N" column — buildImageUrl() turns it into a public URL.
export async function uploadImage(file, hint = 'iphone') {
  const ext = TYPES[file.type];
  if (!ext) throw new Error('Chỉ nhận ảnh PNG, JPG, WEBP hoặc AVIF.');
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Ảnh tối đa 5 MB.');
  const name = `${slugify(hint) || 'iphone'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await getSupabaseBrowser().storage.from(BUCKET).upload(name, file, {
    contentType: file.type,
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return name;
}

export async function listImages() {
  const { data, error } = await getSupabaseBrowser().storage.from(BUCKET).list('', {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error) throw new Error(error.message);
  // Folders come back as entries without an id.
  return (data ?? []).filter((o) => o.id);
}
