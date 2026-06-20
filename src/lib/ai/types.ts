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
