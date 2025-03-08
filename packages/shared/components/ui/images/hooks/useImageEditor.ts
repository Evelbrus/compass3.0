// @shared/components/ui/images/hooks/useImageEditor.ts
'use client';

import { useState, useEffect, useRef } from 'react';
import { getCroppedImg } from '@shared/components/ui/images/utils/cropImage';
import { Area } from 'react-easy-crop';

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useImageEditor = (
  initialImage?: string | null,
  setPreviewCallback?: (url: string) => void,
) => {
  const [originalPreview, setOriginalPreview] = useState<string | null>(initialImage || null);
  const [localPreview, setLocalPreview] = useState<string | null>(initialImage || null);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [showFullImage, setShowFullImage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Синхронизация localPreview с initialImage при изменении
  useEffect(() => {
    setLocalPreview(initialImage || null);
    setOriginalPreview(initialImage || null);
  }, [initialImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOriginalPreview(url);
      setLocalPreview(url);
      if (setPreviewCallback) {
        setPreviewCallback(url);
      }
      setInternalError(null);
    }
  };

  const handleRemove = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
      setOriginalPreview(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const onCropComplete = (_unused: Area, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels({
      x: Math.round(croppedAreaPixels.x),
      y: Math.round(croppedAreaPixels.y),
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    });
  };

  const handleCropSave = async () => {
    if (originalPreview && croppedAreaPixels) {
      try {
        const croppedImageUrl = await getCroppedImg(originalPreview, croppedAreaPixels);
        setLocalPreview(croppedImageUrl);
        if (setPreviewCallback) {
          setPreviewCallback(croppedImageUrl);
        }
        setZoom(1);
        setShowCropper(false);
      } catch (error) {
        setInternalError('Ошибка при кадрировании изображения');
      }
    }
  };

  const handleResetCrop = () => {
    setLocalPreview(originalPreview);
    setShowCropper(false);
  };

  return {
    originalPreview,
    localPreview,
    internalError,
    showCropper,
    crop,
    zoom,
    showFullImage,
    inputRef,
    handleImageChange,
    handleRemove,
    onCropComplete,
    handleCropSave,
    handleResetCrop,
    setShowCropper,
    setCrop,
    setZoom,
    setShowFullImage,
  };
};
