'use client';

import React from 'react';
import Cropper from 'react-easy-crop';
import ModalFullImage from '@shared/components/ui/images/ui/ModalFullImage';
import { useImageEditor } from '@shared/components/ui/images/hooks/useImageEditor';
import { EyeIcon, CropIcon, TrashIcon, UndoIcon, UploadIcon } from 'lucide-react';

interface ImageUploadWithCropProps {
  initialSrc?: string | null;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  onChange?: (file: File | null) => void;
  label?: string;
  className?: string;
  containerWidth?: number | string;
  containerHeight?: number | string;
  aspect?: number;
  mode?: 'upload' | 'gallery';
}

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  initialSrc,
  required = false,
  error = false,
  errorMessage = '',
  onChange,
  label = 'Фото:',
  className = '',
  containerWidth = 400,
  containerHeight = 350,
  aspect = 1,
  mode = 'upload',
}) => {
  const {
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
  } = useImageEditor(initialSrc);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
    if (onChange) {
      const file = e.target.files?.[0] || null;
      onChange(file);
    }
  };

  const handleRemoveClick = () => {
    handleRemove();
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-start  ${className}`}>
      {mode === 'upload' && (
        <label className="block text-4 font-medium text-gray-500 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`w-full ${mode === 'upload' ? 'border-2 border-dashed border-gray-400' : ''} rounded-lg bg-white overflow-hidden relative`}
        style={{ width: containerWidth, height: containerHeight }}
      >
        {localPreview ? (
          <>
            <div className="absolute top-2 right-2 grid gap-1">
              <button
                type="button"
                onClick={() => setShowFullImage(true)}
                className="text-gray-600 hover:text-blue-600 p-1 rounded-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  backdropFilter: 'blur(5px)',
                  border: 'none',
                }}
              >
                <EyeIcon size={20} />
              </button>
              <button
                type="button"
                onClick={() => setShowCropper(true)}
                className="text-gray-600 hover:text-green-600 p-1 rounded-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  backdropFilter: 'blur(5px)',
                  border: 'none',
                }}
              >
                <CropIcon size={20} />
              </button>
              <button
                type="button"
                onClick={handleResetCrop}
                className="text-gray-600 hover:text-yellow-600 p-1 rounded-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  backdropFilter: 'blur(5px)',
                  border: 'none',
                }}
              >
                <UndoIcon size={20} />
              </button>
              <button
                type="button"
                onClick={handleRemoveClick}
                className="text-gray-600 hover:text-red-600 p-1 rounded-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                  backdropFilter: 'blur(5px)',
                  border: 'none',
                }}
              >
                <TrashIcon size={20} />
              </button>
            </div>
            {showCropper && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div className="relative bg-white p-4 rounded">
                  <div className="w-[300px] h-[300px] relative">
                    <Cropper
                      image={originalPreview || localPreview}
                      crop={crop}
                      zoom={zoom}
                      aspect={aspect}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={onCropComplete}
                    />
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="mr-2 px-4 py-2 bg-gray-300 rounded"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleCropSave}
                      className="px-4 py-2 bg-green-500 text-white rounded"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            )}
            <img
              src={localPreview}
              alt="Предпросмотр"
              className="w-full h-full object-cover rounded-lg p-1"
            />
          </>
        ) : (
          <img
            src="/placeholderImage.png"
            alt="Плейсхолдер"
            className="object-contain w-full h-full p-8 mx-auto my-auto"
          />
        )}
      </div>

      {mode === 'upload' && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg flex items-center gap-2"
          >
            <UploadIcon size={20} /> Загрузить фото
          </button>
          <input
            type="file"
            accept="image/*"
            ref={inputRef}
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}

      {internalError && <p className="text-red-500 text-center mt-2">{internalError}</p>}
      {error && errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}

      {showFullImage && localPreview && (
        <ModalFullImage imageSrc={localPreview} onClose={() => setShowFullImage(false)} />
      )}
    </div>
  );
};
