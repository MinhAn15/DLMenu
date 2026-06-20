import type { StylePreset, AiPresetId } from './types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'rustic',
    name: 'Mộc mạc Di Linh',
    description: 'Ảnh chân thực như chụp bằng điện thoại, vibe quán cóc vỉa hè',
    icon: 'Coffee',
    promptTemplate:
      'Amateur food photography shot on iPhone 14 Pro, candid, raw, authentic. {itemName}, sitting on a slightly messy local Vietnamese coffee shop wooden table. Natural window lighting, slightly underexposed. Water condensation on the glass. Casual setting, no studio lighting, imperfect composition.',
    negativePrompt:
      'studio lighting, perfect composition, stock photo, overexposed, artificial, plastic, cartoon, illustration',
    strength: 0.8,
  },
  {
    id: 'studio',
    name: 'Studio chuyên nghiệp',
    description: 'Món cao cấp, ánh sáng studio mềm, chuyên nghiệp',
    icon: 'Aperture',
    promptTemplate:
      'Professional culinary photography, soft studio lighting, shallow depth of field. {itemName} beautifully plated, elegant presentation on a dark ceramic plate. Warm rim lighting, subtle steam, premium restaurant quality.',
    negativePrompt:
      'amateur, blurry, dark, underexposed, messy, casual, phone photo, grainy',
    strength: 0.9,
  },
  {
    id: 'minimal',
    name: 'Minimal trắng',
    description: 'Menu hiện đại, sạch sẽ, tối giản trên nền trắng',
    icon: 'Minus',
    promptTemplate:
      'Clean minimal food photography, bright white background, soft diffused light from above. {itemName} centered, generous white space, no props, no table, no texture. Clinical cleanliness, editorial style.',
    negativePrompt:
      'dark background, messy, props, table, texture, grain, vintage, warm tones',
    strength: 0.85,
  },
  {
    id: 'dramatic',
    name: 'Tối dramatic',
    description: 'Đồ uống đặc biệt, ánh sáng mạnh, tối và ma mị',
    icon: 'Moon',
    promptTemplate:
      'Dark moody food photography, dramatic side lighting, deep shadows, rich blacks. {itemName}, single spotlight from the left, black slate surface, wisps of smoke or steam. Cinematic, high contrast, film noir atmosphere.',
    negativePrompt:
      'bright, white, cheerful, casual, overexposed, flat lighting, stock photo',
    strength: 0.85,
  },
  {
    id: 'tropical',
    name: 'Nhiệt đới tươi sáng',
    description: 'Trái cây, sinh tố, màu sắc rực rỡ, tự nhiên',
    icon: 'Sun',
    promptTemplate:
      'Bright vibrant tropical food photography, natural outdoor light, lush greenery bokeh. {itemName}, colorful fresh ingredients visible, tropical fruits as garnish, condensation on cold glass. Saturated colors, joyful, summery.',
    negativePrompt:
      'dark, moody, winter, muted, desaturated, studio, artificial lighting, minimalist',
    strength: 0.85,
  },
  {
    id: 'vintage',
    name: 'Vintage hoài cổ',
    description: 'Quán mang phong cách cổ, ấm áp, hoài niệm',
    icon: 'Clock',
    promptTemplate:
      'Vintage film photography, warm sepia tones, slight grain, nostalgic feel. {itemName} on a weathered wooden table, old tarnished spoon, faded cloth napkin. Afternoon golden hour light through a dusty window. Kodak Portra 400 film simulation.',
    negativePrompt:
      'modern, bright, clinical, digital, sharp, neon, oversaturated, minimalist, white background',
    strength: 0.8,
  },
];

export function getPreset(id: AiPresetId): StylePreset | undefined {
  return STYLE_PRESETS.find((p) => p.id === id);
}

export function buildPrompt(presetId: AiPresetId, userText?: string): string {
  const preset = getPreset(presetId);
  if (!preset) throw new Error(`Unknown preset: ${presetId}`);

  const itemName = userText || 'A Vietnamese dish';
  return preset.promptTemplate.replace('{itemName}', itemName);
}
