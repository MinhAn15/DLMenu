'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, RotateCw, Check, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ImageGenerator.module.css';
import Dropzone from './Dropzone';
import PresetCard from './PresetCard';
import Button from '@/components/ui/Button';
import { STYLE_PRESETS, buildPrompt } from '@/lib/ai/presets';
import type { AiGenerationMode, AiPresetId } from '@/lib/ai/types';
import { generateMenuItemImage } from '@/lib/ai/generate-image';
import toast from 'react-hot-toast';

interface ImageGeneratorProps {
  shopId: string;
  itemId: string;
  onImageGenerated: (url: string) => void;
  currentImageUrl?: string | null;
}

export default function ImageGenerator({
  shopId,
  itemId,
  onImageGenerated,
  currentImageUrl,
}: ImageGeneratorProps) {
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tạo ảnh';
      toast.error(message);
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

      <div className={styles.modeContent}>
        {mode === 'image-to-image' ? (
          <Dropzone
            onFileSelect={(file, preview) => {
              setSourceFile(file);
              setSourcePreview(preview);
            }}
            currentPreview={sourcePreview}
            onClear={() => {
              setSourceFile(null);
              setSourcePreview(null);
            }}
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

      <Button
        onClick={handleGenerate}
        loading={generating}
        fullWidth
        disabled={mode === 'text-to-image' ? !prompt.trim() : !sourceFile}
      >
        <Sparkles size={16} /> Tạo ảnh
      </Button>

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
          <textarea className={styles.rawPrompt} value={builtPrompt} readOnly rows={4} />
        </div>
      )}
    </div>
  );
}
