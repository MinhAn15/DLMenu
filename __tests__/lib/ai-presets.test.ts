import { STYLE_PRESETS, getPreset, buildPrompt } from '@/lib/ai/presets';
import type { AiPresetId } from '@/lib/ai/types';

describe('AI Image Generation - Presets', () => {
  test('should have 6 presets', () => {
    expect(STYLE_PRESETS).toHaveLength(6);
  });

  test('each preset has required fields', () => {
    STYLE_PRESETS.forEach((preset) => {
      expect(preset.id).toBeTruthy();
      expect(preset.name).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.icon).toBeTruthy();
      expect(preset.promptTemplate).toContain('{itemName}');
      expect(preset.negativePrompt).toBeTruthy();
      expect(preset.strength).toBeGreaterThan(0);
      expect(preset.strength).toBeLessThanOrEqual(1);
    });
  });

  test('getPreset returns correct preset', () => {
    const rustic = getPreset('rustic');
    expect(rustic).toBeDefined();
    expect(rustic?.name).toBe('Mộc mạc Di Linh');
  });

  test('getPreset returns undefined for unknown id', () => {
    // @ts-expect-error testing invalid id
    expect(getPreset('unknown')).toBeUndefined();
  });

  test('buildPrompt replaces {itemName}', () => {
    const prompt = buildPrompt('rustic', 'Cà phê sữa đá');
    expect(prompt).toContain('Cà phê sữa đá');
    expect(prompt).not.toContain('{itemName}');
  });

  test('buildPrompt uses default item name when none provided', () => {
    const prompt = buildPrompt('studio');
    expect(prompt).toContain('A Vietnamese dish');
    expect(prompt).not.toContain('{itemName}');
  });

  test('all preset IDs are valid', () => {
    const validIds: AiPresetId[] = ['rustic', 'studio', 'minimal', 'dramatic', 'tropical', 'vintage'];
    validIds.forEach((id) => {
      expect(getPreset(id)).toBeDefined();
    });
  });
});
