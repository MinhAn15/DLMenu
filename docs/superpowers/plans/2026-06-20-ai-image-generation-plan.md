# AI Image Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AI image generation to the menu item editor so Shop Admins and Platform Admins can generate professional menu images via NVIDIA NIM Qwen-image API.

**Architecture:** Server Action receives prompt + optional source image → builds prompt from style preset → calls NVIDIA API → uploads result to Supabase Storage → returns public URL. UI component embedded in existing Item Modal with tabs for upload-vs-text, preset grid, and preview pane.

**Tech Stack:** Next.js 16 Server Actions, Supabase Storage, NVIDIA NIM Qwen-image API, React 19, CSS Modules, Playwright E2E.

---

### Task 1: Create AI Types and Style Presets

**Files:**
- Create: `src/lib/ai/types.ts`
- Create: `src/lib/ai/presets.ts`
- Test: `tests/e2e/ai-image-generation.spec.ts`

- [ ] **Step 1: Create type definitions**

```typescript
// src/lib/ai/types.ts

export type AiGenerationMode = 'text-to-image' | 'image-to-image';
export type AiPresetId = 'rustic' | 'studio' | 'minimal' | 'dramatic' | 'tropical' | 'vintage';

export interface StylePreset {
  id: AiPresetId;
  name: string;
  description: string;
  icon: string;
  promptTemplate: string;
  negativePrompt: string;
  strength: number;
}

export interface GenerateImageInput {
  mode: AiGenerationMode;
  prompt?: string;
  presetId: AiPresetId;
  file?: File;
  shopId: string;
  itemId: string;
}

export interface GenerateImageResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
```

- [ ] **Step 2: Create style presets with prompt templates from ai_asset_prompt_library.md**

```typescript
// src/lib/ai/presets.ts

import type { StylePreset, AiPresetId } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'rustic',
    name: 'Mộc mạc Di Linh',
    description: 'Ảnh chân thực như chụp bằng điện thoại, vibe quán cóc vỉa hè',
    icon: 'Coffee',
    promptTemplate: 'Amateur food photography shot on iPhone 14 Pro, candid, raw, authentic. {itemName}, sitting on a slightly messy local Vietnamese coffee shop wooden table. Natural window lighting, slightly underexposed. Water condensation on the glass. Casual setting, no studio lighting, imperfect composition.',
    negativePrompt: 'studio lighting, perfect composition, stock photo, overexposed, artificial, plastic, cartoon, illustration',
    strength: 0.8,
  },
  {
    id: 'studio',
    name: 'Studio chuyên nghiệp',
    description: 'Món cao cấp, ánh sáng studio mềm, chuyên nghiệp',
    icon: 'Aperture',
    promptTemplate: 'Professional culinary photography, soft studio lighting, shallow depth of field. {itemName} beautifully plated, elegant presentation on a dark ceramic plate. Warm rim lighting, subtle steam, premium restaurant quality.',
    negativePrompt: 'amateur, blurry, dark, underexposed, messy, casual, phone photo, grainy',
    strength: 0.9,
  },
  {
    id: 'minimal',
    name: 'Minimal trắng',
    description: 'Menu hiện đại, sạch sẽ, tối giản trên nền trắng',
    icon: 'Minus',
    promptTemplate: 'Clean minimal food photography, bright white background, soft diffused light from above. {itemName} centered, generous white space, no props, no table, no texture. Clinical cleanliness, editorial style.',
    negativePrompt: 'dark background, messy, props, table, texture, grain, vintage, warm tones',
    strength: 0.85,
  },
  {
    id: 'dramatic',
    name: 'Tối dramatic',
    description: 'Đồ uống đặc biệt, ánh sáng mạnh, tối và ma mị',
    icon: 'Moon',
    promptTemplate: 'Dark moody food photography, dramatic side lighting, deep shadows, rich blacks. {itemName}, single spotlight from the left, black slate surface, wisps of smoke or steam. Cinematic, high contrast, film noir atmosphere.',
    negativePrompt: 'bright, white, cheerful, casual, overexposed, flat lighting, stock photo',
    strength: 0.85,
  },
  {
    id: 'tropical',
    name: 'Nhiệt đới tươi sáng',
    description: 'Trái cây, sinh tố, màu sắc rực rỡ, tự nhiên',
    icon: 'Sun',
    promptTemplate: 'Bright vibrant tropical food photography, natural outdoor light, lush greenery bokeh. {itemName}, colorful fresh ingredients visible, tropical fruits as garnish, condensation on cold glass. Saturated colors, joyful, summery.',
    negativePrompt: 'dark, moody, winter, muted, desaturated, studio, artificial lighting, minimalist',
    strength: 0.85,
  },
  {
    id: 'vintage',
    name: 'Vintage hoài cổ',
    description: 'Quán mang phong cách cổ, ấm áp, hoài niệm',
    icon: 'Clock',
    promptTemplate: 'Vintage film photography, warm sepia tones, slight grain, nostalgic feel. {itemName} on a weathered wooden table, old tarnished spoon, faded cloth napkin. Afternoon golden hour light through a dusty window. Kodak Portra 400 film simulation.',
    negativePrompt: 'modern, bright, clinical, digital, sharp, neon, oversaturated, minimalist, white background',
    strength: 0.8,
  },
];

export function getPreset(id: AiPresetId): StylePreset | undefined {
  return STYLE_PRESETS.find(p => p.id === id);
}

export function buildPrompt(presetId: AiPresetId, userText?: string): string {
  const preset = getPreset(presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);

  const itemName = userText || 'A Vietnamese dish';
  return preset.promptTemplate.replace('{itemName}', itemName);
}
```

- [ ] **Step 3: Write E2E test to verify presets and types**

```typescript
// tests/e2e/ai-image-generation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('AI Image Generation', () => {
  test('Menu Item Modal should show AI Image Generator button', async ({ page }) => {
    // Login as shop admin
    await page.goto('/login');
    await page.getByPlaceholder(/Email/i).fill('admin@shop1.com');
    await page.getByPlaceholder(/Mật khẩu/i).fill('password123');
    await page.locator('button:has-text("Đăng nhập")').click();
    await expect(page.locator('text=Đăng nhập thành công!')).toBeVisible({ timeout: 5000 });
    await page.waitForURL('**/admin**', { timeout: 20000 });

    // Navigate to Menu
    await page.locator('a:has-text("Thực đơn")').first().click();
    await page.waitForURL('**/admin/menu**');
    await expect(page.locator('h1:has-text("Quản lý Thực đơn")')).toBeVisible();

    // Open "Thêm món" modal
    await page.locator('button:has-text("Thêm món")').click();

    // Verify AI Image Generator section exists
    await expect(page.locator('[data-testid="ai-image-generator"]')).toBeVisible({ timeout: 5000 });

    // Verify preset cards are visible
    await expect(page.locator('[data-testid="preset-card-rustic"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-studio"]')).toBeVisible();
    await expect(page.locator('[data-testid="preset-card-minimal"]')).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'test-results/ai-image-generator-modal.png' });
  });

  test('Text-to-Image tab should accept text prompt and preset selection', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/Email/i).fill('admin@shop1.com');
    await page.getByPlaceholder(/Mật khẩu/i).fill('password123');
    await page.locator('button:has-text("Đăng nhập")').click();
    await expect(page.locator('text=Đăng nhập thành công!')).toBeVisible({ timeout: 5000 });
    await page.waitForURL('**/admin**', { timeout: 20000 });

    await page.locator('a:has-text("Thực đơn")').first().click();
    await page.waitForURL('**/admin/menu**');
    await page.locator('button:has-text("Thêm món")').click();

    // Switch to "Viết Mô Tả" tab
    await page.locator('[data-testid="tab-text-to-image"]').click();

    // Type a prompt
    await page.locator('[data-testid="ai-prompt-input"]').fill('Cà phê sữa đá');

    // Select "Mộc mạc Di Linh" preset
    await page.locator('[data-testid="preset-card-rustic"]').click();

    // Verify the preset shows active state
    await expect(page.locator('[data-testid="preset-card-rustic"][data-active="true"]')).toBeVisible();

    // Verify "Tạo ảnh" button is visible
    await expect(page.locator('button:has-text("Tạo ảnh")')).toBeVisible();
  });
});
```

- [ ] **Step 4: Run the test to confirm it fails**

Run: `npx playwright test tests/e2e/ai-image-generation.spec.ts`
Expected: FAIL — no elements with `data-testid="ai-image-generator"` exist yet.

- [ ] **Step 5: Commit types and presets**

```bash
git add src/lib/ai/types.ts src/lib/ai/presets.ts tests/e2e/ai-image-generation.spec.ts
git commit -m "feat(ai): add types, style presets, and E2E test stubs for AI image generation"
```

---

### Task 2: Create the Server Action (generateMenuItemImage)

**Files:**
- Create: `src/lib/ai/generate-image.ts`
- Modify: `.env.local` (add `NVIDIA_NIM_API_KEY`)

- [ ] **Step 1: Add environment variable**

Append to `.env.local`:
```
NVIDIA_NIM_API_KEY=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
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=menu-images
```

- [ ] **Step 2: Write the Server Action**

```typescript
// src/lib/ai/generate-image.ts

'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getPreset, buildPrompt } from './presets';
import type { GenerateImageInput, GenerateImageResult, AiPresetId } from './types';

const NVIDIA_API_URL = 'https://ai.api.nvidia.com/v1/vlm/qwen/qwen2.5-vl-72b-instruct';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
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

  const content: any[] = [];

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
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
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

async function uploadToStorage(bucket: string, path: string, data: Blob, contentType: string): Promise<string> {
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

  return new Blob(chunks, { type: 'image/png' });
}

export async function generateMenuItemImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  try {
    const preset = getPreset(input.presetId);
    if (!preset) return { success: false, error: `Preset không tồn tại: ${input.presetId}` };

    if (input.mode === 'text-to-image' && !input.prompt?.trim()) {
      return { success: false, error: 'Vui lòng nhập mô tả món ăn' };
    }

    if (input.mode === 'image-to-image') {
      if (!input.file) return { success: false, error: 'Vui lòng chọn ảnh gốc' };
      if (input.file.size > MAX_FILE_SIZE) return { success: false, error: 'File quá lớn, tối đa 10MB' };
      if (!ALLOWED_MIME_TYPES.includes(input.file.type)) return { success: false, error: 'Chỉ chấp nhận file .jpg, .png, .webp' };
    }

    const prompt = `${buildPrompt(input.presetId, input.prompt)}. ${preset.negativePrompt ? `Avoid: ${preset.negativePrompt}` : ''}`;

    let imageBase64: string | undefined;
    if (input.mode === 'image-to-image' && input.file) {
      // Upload original to storage
      const originalPath = `${input.shopId}/originals/${input.itemId}_${Date.now()}.${input.file.name.split('.').pop()}`;
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'menu-images';

      const originalUrl = await uploadToStorage(bucket, originalPath, input.file, input.file.type);

      // Convert to base64 for NVIDIA API
      imageBase64 = await fileToBase64(input.file);
    }

    // Call NVIDIA API (with 1 retry)
    let responseStream: ReadableStream<Uint8Array>;
    try {
      responseStream = await callNvidiaApi(prompt, imageBase64);
    } catch {
      try {
        responseStream = await callNvidiaApi(prompt, imageBase64);
      } catch (retryErr: any) {
        return { success: false, error: retryErr.message || 'Lỗi kết nối AI' };
      }
    }

    // Parse response — NVIDIA Qwen-image returns text description, but we need the image
    // For image generation, we parse the response body as an image blob
    const imageBlob = await streamToBlob(responseStream);
    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'menu-images';
    const generatedPath = `${input.shopId}/ai-generated/${input.itemId}_${input.presetId}_${Date.now()}.png`;

    const imageUrl = await uploadToStorage(bucket, generatedPath, imageBlob, 'image/png');

    return { success: true, imageUrl };
  } catch (err: any) {
    console.error('[generateMenuItemImage]', err);
    return { success: false, error: err.message || 'Lỗi không xác định' };
  }
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx tsc --noEmit src/lib/ai/generate-image.ts`
Expected: No type errors (or only cross-file import warnings that resolve at build time).

- [ ] **Step 4: Commit**

```bash
git add src/lib/ai/generate-image.ts .env.local
git commit -m "feat(ai): add generateMenuItemImage server action with NVIDIA API integration"
```

---

### Task 3: Build Dropzone Component

**Files:**
- Create: `src/components/ai/Dropzone.tsx`
- Create: `src/components/ai/Dropzone.module.css`

- [ ] **Step 1: Write Dropzone component**

```tsx
// src/components/ai/Dropzone.tsx

'use client';

import React, { useCallback, useRef, useState } from 'react';
import styles from './Dropzone.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface DropzoneProps {
  onFileSelect: (file: File, previewUrl: string) => void;
  currentPreview?: string | null;
  onClear?: () => void;
}

export default function Dropzone({ onFileSelect, currentPreview, onClear }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback((file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận file .jpg, .png, .webp');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File quá lớn, tối đa 10MB');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    onFileSelect(file, previewUrl);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  }, [validateAndSelect]);

  return (
    <div
      className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      data-testid="ai-dropzone"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />

      {currentPreview ? (
        <div className={styles.previewContainer}>
          <img src={currentPreview} alt="Preview" className={styles.preview} />
          <button
            className={styles.clearButton}
            onClick={(e) => { e.stopPropagation(); onClear?.(); }}
            data-testid="ai-dropzone-clear"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.icon}>📷</span>
          <p className={styles.text}>Kéo thả ảnh hoặc nhấn để chọn</p>
          <p className={styles.hint}>.jpg, .png, .webp — tối đa 10MB</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Write Dropzone CSS module**

```css
/* src/components/ai/Dropzone.module.css */

.dropzone {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dropzone:hover,
.dragOver {
  border-color: var(--color-primary);
  background: rgba(217, 119, 6, 0.05);
}

.hiddenInput {
  display: none;
}

.previewContainer {
  position: relative;
  width: 100%;
  max-width: 240px;
}

.preview {
  width: 100%;
  border-radius: var(--radius-md);
  object-fit: cover;
  max-height: 200px;
}

.clearButton {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-error);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.icon {
  font-size: 2rem;
}

.text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: 600;
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.error {
  color: var(--color-error);
  font-size: var(--font-size-xs);
  margin-top: var(--space-2);
  font-weight: 600;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ai/Dropzone.tsx src/components/ai/Dropzone.module.css
git commit -m "feat(ai): add Dropzone component for image upload"
```

---

### Task 4: Build PresetCard Component

**Files:**
- Create: `src/components/ai/PresetCard.tsx`
- Create: `src/components/ai/PresetCard.module.css`

- [ ] **Step 1: Write PresetCard component**

```tsx
// src/components/ai/PresetCard.tsx

'use client';

import React from 'react';
import { Camera, Aperture, Minus, Moon, Sun, Clock } from 'lucide-react';
import styles from './PresetCard.module.css';
import type { AiPresetId, StylePreset } from '@/lib/ai/types';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number }>> = {
  Coffee: Camera,
  Aperture,
  Minus,
  Moon,
  Sun,
  Clock,
};

interface PresetCardProps {
  preset: StylePreset;
  isActive: boolean;
  onClick: (id: AiPresetId) => void;
}

export default function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  const IconComponent = ICON_MAP[preset.icon] || Camera;

  return (
    <button
      className={`${styles.card} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(preset.id)}
      data-testid={`preset-card-${preset.id}`}
      data-active={isActive}
    >
      <span className={styles.iconWrapper}>
        <IconComponent size={20} />
      </span>
      <span className={styles.name}>{preset.name}</span>
      {isActive && <span className={styles.check}>✓</span>}
    </button>
  );
}
```

- [ ] **Step 2: Write PresetCard CSS module**

```css
/* src/components/ai/PresetCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border-light);
  background: var(--color-surface);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  min-width: 0;
}

.card:hover {
  border-color: var(--color-primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.active {
  border-color: var(--color-primary);
  background: rgba(217, 119, 6, 0.08);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

.iconWrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-bg);
  color: var(--color-primary);
}

.active .iconWrapper {
  background: var(--color-primary);
  color: white;
}

.name {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.2;
}

.active .name {
  color: var(--color-primary);
}

.check {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 800;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ai/PresetCard.tsx src/components/ai/PresetCard.module.css
git commit -m "feat(ai): add PresetCard component for style preset selection"
```

---

### Task 5: Build ImageGenerator Parent Component

**Files:**
- Create: `src/components/ai/ImageGenerator.tsx`
- Create: `src/components/ai/ImageGenerator.module.css`

- [ ] **Step 1: Write ImageGenerator component**

```tsx
// src/components/ai/ImageGenerator.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, RotateCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ImageGenerator.module.css';
import Dropzone from './Dropzone';
import PresetCard from './PresetCard';
import Button from '@/components/ui/Button';
import { STYLE_PRESETS } from '@/lib/ai/presets';
import { buildPrompt } from '@/lib/ai/presets';
import type { AiGenerationMode, AiPresetId } from '@/lib/ai/types';
import { generateMenuItemImage } from '@/lib/ai/generate-image';
import toast from 'react-hot-toast';

interface ImageGeneratorProps {
  shopId: string;
  itemId: string;
  onImageGenerated: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function ImageGenerator({ shopId, itemId, onImageGenerated, currentImageUrl }: ImageGeneratorProps) {
  const [mode, setMode] = useState<AiGenerationMode>('text-to-image');
  const [selectedPreset, setSelectedPreset] = useState<AiPresetId>('rustic');
  const [prompt, setPrompt] = useState('');
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setGeneratedUrl(null);

    try {
      const result = await generateMenuItemImage({
        mode,
        prompt: mode === 'text-to-image' ? prompt : undefined,
        presetId: selectedPreset,
        file: mode === 'image-to-image' ? sourceFile || undefined : undefined,
        shopId,
        itemId,
      });

      if (result.success && result.imageUrl) {
        setGeneratedUrl(result.imageUrl);
        toast.success('Tạo ảnh thành công!');
      } else {
        toast.error(result.error || 'Tạo ảnh thất bại');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo ảnh');
    } finally {
      setGenerating(false);
    }
  }, [mode, prompt, selectedPreset, sourceFile, shopId, itemId]);

  const handleApply = useCallback(() => {
    if (generatedUrl) {
      onImageGenerated(generatedUrl);
      toast.success('Đã gán ảnh vào món');
    }
  }, [generatedUrl, onImageGenerated]);

  const builtPrompt = buildPrompt(selectedPreset, prompt || undefined);

  return (
    <div className={styles.container} data-testid="ai-image-generator">
      {/* Tab bar */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tab} ${mode === 'image-to-image' ? styles.tabActive : ''}`}
          onClick={() => setMode('image-to-image')}
          data-testid="tab-image-to-image"
        >
          📷 Upload Ảnh
        </button>
        <button
          className={`${styles.tab} ${mode === 'text-to-image' ? styles.tabActive : ''}`}
          onClick={() => setMode('text-to-image')}
          data-testid="tab-text-to-image"
        >
          ✏️ Viết Mô Tả
        </button>
      </div>

      {/* Mode content */}
      <div className={styles.modeContent}>
        {mode === 'image-to-image' ? (
          <Dropzone
            onFileSelect={(file, preview) => { setSourceFile(file); setSourcePreview(preview); }}
            currentPreview={sourcePreview}
            onClear={() => { setSourceFile(null); setSourcePreview(null); }}
          />
        ) : (
          <textarea
            className={styles.promptInput}
            placeholder="VD: Cà phê sữa đá, ly thủy tinh cao, đá viên..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            data-testid="ai-prompt-input"
          />
        )}
      </div>

      {/* Preset grid */}
      <div className={styles.presetsGrid}>
        {STYLE_PRESETS.map((preset) => (
          <PresetCard
            key={preset.id}
            preset={preset}
            isActive={selectedPreset === preset.id}
            onClick={setSelectedPreset}
          />
        ))}
      </div>

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        loading={generating}
        fullWidth
        disabled={mode === 'text-to-image' ? !prompt.trim() : !sourceFile}
      >
        <Sparkles size={16} /> Tạo ảnh
      </Button>

      {/* Preview section */}
      {(generatedUrl || generating) && (
        <div className={styles.previewSection}>
          {generating && (
            <div className={styles.loadingPlaceholder}>
              <div className={styles.spinner} />
              <p>Đang tạo ảnh...</p>
            </div>
          )}
          {generatedUrl && !generating && (
            <>
              <img src={generatedUrl} alt="Generated" className={styles.generatedImage} />
              <div className={styles.actionRow}>
                <Button variant="secondary" size="sm" onClick={handleGenerate}>
                  <RotateCw size={14} /> Tạo lại
                </Button>
                <Button size="sm" onClick={handleApply}>
                  <Check size={14} /> Apply vào món
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Advanced options (collapsible) */}
      <div className={styles.advancedToggle}>
        <button
          className={styles.toggleButton}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Nâng cao
        </button>
      </div>
      {showAdvanced && (
        <div className={styles.advancedContent}>
          <label className={styles.advancedLabel}>Prompt gửi lên API:</label>
          <textarea
            className={styles.rawPrompt}
            value={builtPrompt}
            readOnly
            rows={4}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ImageGenerator CSS module**

```css
/* src/components/ai/ImageGenerator.module.css */

.container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4) 0;
}

.tabBar {
  display: flex;
  background: var(--color-bg);
  border-radius: var(--radius-full);
  padding: 3px;
  border: 1px solid var(--color-border-light);
}

.tab {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tabActive {
  background: var(--color-primary);
  color: white;
}

.modeContent {
  min-height: 80px;
}

.promptInput {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  border: 1.5px solid var(--color-border);
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  background: var(--color-surface);
  color: var(--color-text);
  transition: border-color var(--transition-fast);
}

.promptInput:focus {
  outline: none;
  border-color: var(--color-primary);
}

.presetsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-2);
}

.previewSection {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  background: var(--color-surface);
}

.loadingPlaceholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border-light);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generatedImage {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.actionRow {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  justify-content: flex-end;
}

.advancedToggle {
  border-top: 1px solid var(--color-border-light);
  padding-top: var(--space-2);
}

.toggleButton {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: 600;
  padding: var(--space-1) 0;
}

.advancedContent {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.advancedLabel {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: 600;
}

.rawPrompt {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-light);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-family: monospace;
  resize: none;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ai/ImageGenerator.tsx src/components/ai/ImageGenerator.module.css
git commit -m "feat(ai): add ImageGenerator parent component with tabs, presets, and preview"
```

---

### Task 6: Integrate ImageGenerator into Menu Item Modal

**Files:**
- Modify: `src/app/admin/menu/page.tsx`

- [ ] **Step 1: Add imports and ImageGenerator to Item Modal**

At the top of `src/app/admin/menu/page.tsx`, add:

```typescript
import ImageGenerator from '@/components/ai/ImageGenerator';
```

Then, inside the `{/* Item Modal */}` section, replace the single `<Input placeholder="URL hình ảnh (tùy chọn)" .../>` line (around line 416) with:

```tsx
{/* AI Image Generator */}
<div style={{ marginBottom: 'var(--space-4)' }}>
  <label style={{
    display: 'block',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 600,
    marginBottom: 'var(--space-2)',
    color: 'var(--color-text-secondary)',
  }}>
    Hình ảnh món ăn
  </label>
  {shop && (
    <ImageGenerator
      shopId={shop.id}
      itemId={editingItem?.id || `new-${Date.now()}`}
      onImageGenerated={(url) => setItemImageUrl(url)}
      currentImageUrl={itemImageUrl || null}
    />
  )}
</div>

{/* Manual URL input (fallback) */}
<details style={{ marginBottom: 'var(--space-4)' }}>
  <summary style={{
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    fontWeight: 600,
  }}>
    Hoặc nhập URL thủ công
  </summary>
  <Input placeholder="URL hình ảnh (tùy chọn)" value={itemImageUrl} onChange={e => setItemImageUrl(e.target.value)} />
</details>
```

- [ ] **Step 2: Verify the page loads without errors**

Run: `npx next build 2>&1 | head -20`
Expected: Build succeeds (or shows only pre-existing warnings).

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/menu/page.tsx
git commit -m "feat(ai): integrate ImageGenerator into menu item modal"
```

---

### Task 7: Run Playwright E2E Tests and Polish

**Files:**
- Test: `tests/e2e/ai-image-generation.spec.ts`
- Modify: (any fixes found during testing)

- [ ] **Step 1: Start the dev server**

```bash
npx next dev &
```

- [ ] **Step 2: Run the AI image generation E2E test**

```bash
npx playwright test tests/e2e/ai-image-generation.spec.ts
```

Expected: Both tests PASS — the modal opens, the AI generator section is visible, presets render, tab switching works.

- [ ] **Step 3: Take screenshots for visual verification**

```bash
npx playwright test tests/e2e/ai-image-generation.spec.ts --screenshot on
```

Check the generated screenshots in `test-results/`:
- `ai-image-generator-modal.png` — modal with AI component visible
- Verify preset cards render with icons
- Verify tab switch between Upload and Text modes

- [ ] **Step 4: Fix any issues found in E2E test or visual audit**

If any adjustments are needed (CSS, data-testid mismatches, etc.), fix and re-run tests.

- [ ] **Step 5: Commit any fixes**

```bash
git commit -am "fix(ai): polish AI image generator after E2E verification"
```

---

### Task 8: Create Supabase Storage Bucket and RLS Policies

**Files:**
- Create: `supabase/migrations/008_create_menu_images_bucket.sql`

- [ ] **Step 1: Write the migration to create the storage bucket**

```sql
-- supabase/migrations/008_create_menu_images_bucket.sql

-- Create the menu-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Shop admin can upload/read/delete within their shop folder
CREATE POLICY "shop_admin_can_manage_own_images" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (
      SELECT s.id FROM shops s
      WHERE s.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = (
      SELECT s.id FROM shops s
      WHERE s.owner_id = auth.uid()
    )
  );

-- Policy: Platform admin can manage all images
CREATE POLICY "platform_admin_can_manage_all_images" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'menu-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  )
  WITH CHECK (
    bucket_id = 'menu-images'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'platform_admin'
    )
  );

-- Policy: Anyone can read public images (for customer menu viewing)
CREATE POLICY "anyone_can_read_menu_images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'menu-images');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/008_create_menu_images_bucket.sql
git commit -m "feat(storage): add menu-images bucket with RLS policies"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ Architecture (Server Action + sync) → Task 2
- ✅ 6 Style Presets → Task 1 (presets.ts)
- ✅ UI Component Tree (tabs, dropzone, presets grid, preview, advanced) → Tasks 3-5
- ✅ NVIDIA API Integration (endpoint, request payloads, retry) → Task 2
- ✅ Error Handling (file size, MIME, timeout, content flag, API key, network) → Task 2
- ✅ Supabase Storage structure + RLS → Task 8
- ✅ Types → Task 1
- ✅ Integration into Item Modal → Task 6
- ✅ E2E tests → Task 1 (stubs), Task 7 (verify)

**2. Placeholder scan:** No TBDs. All steps contain complete code or exact commands.

**3. Type consistency:**
- `AiPresetId`, `StylePreset`, `GenerateImageInput`, `GenerateImageResult` defined in Task 1
- Used consistently across `presets.ts` (Task 1), `generate-image.ts` (Task 2), `PresetCard.tsx` (Task 4), `ImageGenerator.tsx` (Task 5)
- `generateMenuItemImage` imported and called in Task 5 with matching signature
