# AI Image Generation for Menu Items

> **Design Doc** — Shop Admin & Platform Admin can generate realistic menu images using NVIDIA NIM Qwen-image API.

**Status:** Draft
**Date:** 2026-06-20

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Client Component (AiImageGenerator)                             │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Tab: Upload Ảnh | Tab: Viết Mô Tả                        │  │
│  │  → Chọn Style Preset → Click "Tạo ảnh"                    │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
│                             │ formData                           │
└─────────────────────────────┼───────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Server Action: generateMenuItemImage(formData)                  │
│                                                                  │
│  1. Validate input (file size ≤ 10 MB, MIME type, prompt)       │
│  2. Upload original file → Supabase Storage (if image-to-image)  │
│  3. Build prompt from preset template + user text                │
│  4. Call NVIDIA NIM Qwen-image API                               │
│  5. Parse response → extract generated image data                │
│  6. Upload result → Supabase Storage                             │
│  7. Return public URL                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Generation engine | Server Action (sync) | Simplest — Qwen-image responds in 2–10s. No queue/job infra needed for MVP. Pattern already exists in project. |
| Storage | Supabase Storage | Already in use. RLS policies keep tenant isolation. No extra service. |
| Access | Shop Admin + Platform Admin | Shop Admin generates for own items. Platform Admin overrides menu items for any shop. |
| Presets | 6 hardcoded vibes | No DB needed. Easy to extend later. |

### File Structure

```
src/
├── lib/ai/
│   ├── generate-image.ts    ← Server Action (main logic)
│   ├── presets.ts           ← 6 style presets + buildPrompt()
│   └── types.ts             ← Input/Output types
├── components/ai/
│   ├── ImageGenerator.tsx    ← Parent component (tabs, presets, preview)
│   ├── PresetCard.tsx       ← Single preset card
│   └── Dropzone.tsx         ← File drag-and-drop / click-to-upload
```

---

## 2. Style Presets

| ID | Name | Best For | Strength |
|---|---|---|---|
| `rustic` | Mộc mạc Di Linh | Ảnh đồ uống chân thực, vibe quán cóc vỉa hè | 0.8 |
| `studio` | Studio chuyên nghiệp | Món cao cấp, ánh sáng studio mềm | 0.9 |
| `minimal` | Minimal trắng | Menu hiện đại, sạch sẽ, tối giản | 0.85 |
| `dramatic` | Tối dramatic | Đồ uống đặc biệt, ánh sáng mạnh, tối | 0.85 |
| `tropical` | Nhiệt đới tươi sáng | Trái cây, sinh tố, màu sắc rực rỡ | 0.85 |
| `vintage` | Vintage hoài cổ | Quán mang phong cách cổ, ấm áp | 0.8 |

Each preset is an object with `name`, `description`, `icon`, `promptTemplate`, `negativePrompt`, and `strength`. Templates draw from the existing `docs/ai_asset_prompt_library.md` philosophy — authentic, imperfect, localized imagery.

### Prompt Building

```
buildPrompt(preset, userText?) → string

Examples:
- "rustic" + "Cà phê sữa đá"
  → "Amateur food photography shot on iPhone 14 Pro... Cà phê sữa đá..."

- "studio" + "Bò bít tết sốt tiêu đen"
  → "Professional culinary photography... Bò bít tết sốt tiêu đen..."
```

---

## 3. UI Component Tree

```
AiImageGenerator
├── TabBar: ["Upload Ảnh" | "Viết Mô Tả"]
│
├── [Tab: Upload Ảnh]
│   └── Dropzone (click/kéo thả, chấp nhận .jpg/.png/.webp, tối đa 10MB)
│       └── ImagePreview (nếu đã chọn file)
│
├── [Tab: Viết Mô Tả]
│   └── TextArea (placeholder: "VD: Cà phê sữa đá, ly thủy tinh...")
│
├── PresetsGrid (2 rows × 3 cols)
│   └── PresetCard × 6
│       ├── Lucide icon + name
│       ├── Active ring + checkmark
│       └── onClick → set preset
│
├── PreviewSection
│   ├── LoadingSkeleton (spinner + "Đang tạo ảnh...")
│   ├── GeneratedImage (kết quả)
│   └── ActionRow: [Tạo lại] [Apply vào món]
│
└── AdvancedOptions (collapsible)
    ├── RawPromptDisplay (readonly, copyable)
    └── StrengthSlider (0–1, chỉ image-to-image)
```

### Integration Point

The component replaces the "URL hình ảnh" Input in the existing Item Modal (`src/app/admin/menu/page.tsx`). Both manual URL input and AI generation coexist:

```
┌──────────────────────────────────┐
│  Hình ảnh món ăn                  │
│  ┌──────────────────────────────┐ │
│  │ [Upload Ảnh | Viết Mô Tả]   │ │
│  │ ...AiImageGenerator...       │ │
│  │ [URL thủ công] _____________ │ │
│  └──────────────────────────────┘ │
└──────────────────────────────────┘
```

---

## 4. NVIDIA API Integration

### Endpoint

```
POST https://ai.api.nvidia.com/v1/vlm/qwen/qwen2.5-vl-72b-instruct
Authorization: Bearer ${NVIDIA_NIM_API_KEY}
```

### Request Payloads

**Text-to-Image:**
```json
{
  "messages": [{
    "role": "user",
    "content": [
      {"type": "text", "text": "Professional culinary photography, soft studio lighting... A Vietnamese iced milk coffee on a wooden table..."}
    ]
  }],
  "max_tokens": 512,
  "temperature": 0.2,
  "top_p": 0.7
}
```

**Image-to-Image:**
```json
{
  "messages": [{
    "role": "user",
    "content": [
      {"type": "image_url", "image_url": {"url": "data:image/jpeg;base64,..."}},
      {"type": "text", "text": "Professional culinary photography, soft studio lighting... Enhance this drink photo..."}
    ]
  }],
  ...
}
```

### Error Handling (Client + Server)

| Scenario | Handling |
|---|---|
| File > 10 MB | Client-side reject + toast |
| Non-image file | MIME validation + toast |
| API timeout / 5xx | Toast: "Server AI đang bận, thử lại sau" |
| Content flagged | Toast: "Prompt không phù hợp, vui lòng thử lại" |
| API key missing | Server log error, toast: "Lỗi cấu hình AI" |
| Generate lại | Regenerate with same prompt + new seed |
| Network failure | Auto-retry 1x, then toast error |

---

## 5. Supabase Storage

```
menu-images/
└── {shop_id}/
    ├── originals/{item_id}_{timestamp}.jpg
    └── ai-generated/{item_id}_{preset}_{timestamp}.jpg
```

**RLS:**
- Shop Admin: CRUD trên folder `{shop_id}/` của shop mình
- Platform Admin: CRUD trên tất cả shops
- Anonymous: read-only public URLs

Environment variables to add:
```
NVIDIA_NIM_API_KEY=nvapi-...
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=menu-images
```

---

## 6. Types

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
  strength: number; // 0–1, controls influence on source image
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

---

## 7. Future Upgrades (non-MVP)

- **Generation history**: New DB table `ai_generation_jobs`, show past generations per item
- **Custom presets**: Shop Admin saves custom prompt templates
- **Batch generate**: Generate images for multiple items at once
- **Supabase Edge Function**: Replace Server Action if timeout becomes an issue (Edge Function allows 900s)
- **Webhook delivery**: NVIDIA webhook for async generation of complex images

---

## 8. Open Questions

- Khi user apply ảnh, cần confirm overwrite ảnh cũ không?
- Platform Admin có cần chọn shop context trước khi generate?
- Storage bucket cần tạo thủ công qua Supabase Dashboard hay migration?
