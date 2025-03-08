// @shared/components/ui/images/ui/ImageUploadWithCrop.tsx
'use client';

import React from 'react';
import Cropper from 'react-easy-crop';
import ModalFullImage from '@shared/components/ui/images/ui/ModalFullImage';
import { useImageEditor } from '@shared/components/ui/images/hooks/useImageEditor';
import { EyeIcon, CropIcon, TrashIcon, UndoIcon, UploadIcon } from 'lucide-react';
import { useSession } from '@shared/utils/hooks/useSession';
import { UserRole } from '@prisma/client';

interface ImageUploadWithCropProps {
  initialImage?: string | null;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  onChange?: (file: File | null) => void;
  label?: string | null;
  className?: string;
  containerWidth?: string; // Убрали number, теперь только строка
  containerHeight?: string; // Убрали number, теперь только строка
  aspect?: number;
  mode?: 'upload' | 'gallery' | 'view';
}

export const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  initialImage,
  required = false,
  error = false,
  errorMessage = '',
  onChange,
  label = null,
  className = '',
  containerWidth = '450px', // Значение по умолчанию — строка
  containerHeight = '100%', // Значение по умолчанию — строка
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
  } = useImageEditor(initialImage);

  const session = useSession();

  const canEdit =
    session &&
    (session.userSession?.role === UserRole.Operator ||
      session.userSession?.role === UserRole.Admin);

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

  // Преобразуем containerWidth и containerHeight в классы Tailwind
  const widthClass = containerWidth === 'w-full' ? 'max-w-full' : `max-w-${containerWidth}`;
  const heightClass = containerHeight === 'h-full' ? 'max-h-full' : `max-h-${containerHeight}`;

  return (
    <div className={`w-full h-full flex flex-col items-center justify-start ${className}`}>
      {mode === 'upload' && (
        <label className="block text-gray-700 text-base font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`w-full ${
          mode === 'upload' ? 'border-2 border-dashed border-[#E2E8F0]' : ''
        } rounded-lg bg-white overflow-hidden relative w-full h-[${containerHeight}] ${widthClass} ${heightClass}`}
      >
        {localPreview ? (
          <>
            {mode !== 'view' && (
              <div className="absolute top-2 right-2 grid gap-1">
                <button
                  type="button"
                  onClick={() => setShowFullImage(true)}
                  className="text-gray-600 hover:text-blue-600 rounded-sm"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                    backdropFilter: 'blur(5px)',
                    border: 'none',
                  }}
                >
                  <EyeIcon size={20} />
                </button>
                {mode === 'upload' && canEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowCropper(true)}
                      className="text-gray-600 hover:text-green-600 rounded-sm"
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
                      className="text-gray-600 hover:text-yellow-600 rounded-sm"
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
                      className="text-gray-600 hover:text-red-600 rounded-sm"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                        backdropFilter: 'blur(5px)',
                        border: 'none',
                      }}
                    >
                      <TrashIcon size={20} />
                    </button>
                  </>
                )}
              </div>
            )}
            {showCropper && mode === 'upload' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                <div className="relative bg-white p-6 rounded-lg shadow-lg">
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
                  <div className="flex justify-end mt-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCropper(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleCropSave}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-md transition-colors"
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
              className="w-full h-full object-contain rounded-lg"
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src="/placeholderImage.png"
              alt="Плейсхолдер"
              className="object-contain w-2/3 h-2/3 mx-auto opacity-40"
            />
            {mode === 'upload' && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-md flex items-center gap-2 shadow-sm transition-colors"
              >
                <UploadIcon size={20} /> Загрузить фото
              </button>
            )}
          </div>
        )}

        {localPreview && mode === 'upload' && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-md flex items-center gap-2 shadow-sm transition-colors text-sm"
            >
              <UploadIcon size={16} /> Изменить фото
            </button>
          </div>
        )}
      </div>

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={handleInputChange}
      />

      {internalError && <p className="text-red-500 text-sm mt-2">{internalError}</p>}
      {error && errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

      {showFullImage && localPreview && (
        <ModalFullImage imageSrc={localPreview} onClose={() => setShowFullImage(false)} />
      )}
    </div>
  );
};
