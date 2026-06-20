'use client';

import React, { useCallback, useRef, useState } from 'react';
import styles from './Dropzone.module.css';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
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

  const validateAndSelect = useCallback(
    (file: File) => {
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
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  return (
    <div
      className={`${styles.dropzone} ${dragOver ? styles.dragOver : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
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
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
            }}
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
