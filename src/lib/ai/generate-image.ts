'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPreset, buildPrompt } from './presets';
import type { GenerateImageInput, GenerateImageResult } from './types';

const NVIDIA_API_URL = 'https://ai.api.nvidia.com/v1/vlm/qwen/qwen2.5-vl-72b-instruct';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callNvidiaApi(prompt: string, imageBase64?: string): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) throw new Error('NVIDIA_NIM_API_KEY not configured');

  const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  if (imageBase64) {
    content.push({
      type: 'image_url',
      image_url: { url: imageBase64 },
    });
  }

  content.push({ type: 'text', text: prompt });

  const body = {
    messages: [{ role: 'user', content }],
    max_tokens: 512,
    temperature: 0.2,
    top_p: 0.7,
  };

  const response = await fetch(NVIDIA_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 422) throw new Error('Prompt không phù hợp, vui lòng thử lại');
    if (response.status >= 500) throw new Error('Server AI đang bận, thử lại sau');
    throw new Error(`Lỗi API: ${response.status} — ${errorText}`);
  }

  return response.body as ReadableStream<Uint8Array>;
}

async function uploadToStorage(
  bucket: string,
  path: string,
  data: Blob,
  contentType: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.storage.from(bucket).upload(path, data, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(`Lưu ảnh thất bại: ${error.message}`);

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

async function streamToBlob(stream: ReadableStream<Uint8Array>): Promise<Blob> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([merged.buffer as ArrayBuffer], { type: 'image/png' });
}

export async function generateMenuItemImage(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  try {
    const preset = getPreset(input.presetId);
    if (!preset)
      return { success: false, error: `Preset không tồn tại: ${input.presetId}` };

    if (input.mode === 'text-to-image' && !input.prompt?.trim()) {
      return { success: false, error: 'Vui lòng nhập mô tả món ăn' };
    }

    if (input.mode === 'image-to-image') {
      if (!input.file)
        return { success: false, error: 'Vui lòng chọn ảnh gốc' };
      if (input.file.size > MAX_FILE_SIZE)
        return { success: false, error: 'File quá lớn, tối đa 10MB' };
      if (!ALLOWED_MIME_TYPES.includes(input.file.type))
        return { success: false, error: 'Chỉ chấp nhận file .jpg, .png, .webp' };
    }

    const prompt = `${buildPrompt(input.presetId, input.prompt)}${
      preset.negativePrompt ? `. Avoid: ${preset.negativePrompt}` : ''
    }`;

    let imageBase64: string | undefined;
    if (input.mode === 'image-to-image' && input.file) {
      const ext = input.file.name.split('.').pop() || 'jpg';
      const originalPath = `${input.shopId}/originals/${input.itemId}_${Date.now()}.${ext}`;
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'menu-images';

      await uploadToStorage(bucket, originalPath, input.file, input.file.type);
      imageBase64 = await fileToBase64(input.file);
    }

    let responseStream: ReadableStream<Uint8Array>;
    try {
      responseStream = await callNvidiaApi(prompt, imageBase64);
    } catch {
      try {
        responseStream = await callNvidiaApi(prompt, imageBase64);
      } catch (retryErr: unknown) {
        const message = retryErr instanceof Error ? retryErr.message : 'Lỗi kết nối AI';
        return { success: false, error: message };
      }
    }

    const imageBlob = await streamToBlob(responseStream);
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'menu-images';
    const generatedPath = `${input.shopId}/ai-generated/${input.itemId}_${input.presetId}_${Date.now()}.png`;

    const imageUrl = await uploadToStorage(bucket, generatedPath, imageBlob, 'image/png');

    return { success: true, imageUrl };
  } catch (err: unknown) {
    console.error('[generateMenuItemImage]', err);
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    return { success: false, error: message };
  }
}
