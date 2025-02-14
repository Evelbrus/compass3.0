'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '../../images';

interface ImageUploadProps {
  name: string;
  label: string;
  defaultImage?: string;
  maxWidth?: number;
  maxHeight?: number;
  error?: boolean;
  message?: string;
  className?: string;
  placeholder?: string;
  value?: string;
  readonly?: boolean;
  requiredStar?: boolean;
  licensePhoto?: boolean;
  passportPhoto?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  name,
  label,
  defaultImage,
  maxWidth = 1024,
  maxHeight = 1024,
  error = false,
  message = '',
  className = '',
  placeholder = '/placeholderImage.png',
  passportPhoto = false,
  licensePhoto = false,
  value,
  readonly = false,
  requiredStar = false,
}) => {
  const { control, setValue } = useFormContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value || defaultImage || null);
  const [internalError, setInternalError] = useState<string | null>(null);

  const file = useWatch({ name, control });

  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(value || defaultImage || null);
    }
  }, [file, value, defaultImage]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInternalError(null);

    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      const url = URL.createObjectURL(selectedFile);
      const img = new Image();
      img.src = url;

      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          setInternalError(`Размер изображения не должен превышать ${maxWidth}x${maxHeight}px.`);
          URL.revokeObjectURL(url);
          setValue(name, undefined);
          return;
        }
        setValue(name, selectedFile);
      };

      img.onerror = () => {
        setInternalError('Ошибка загрузки изображения. Попробуйте другой файл.');
        URL.revokeObjectURL(url);
        setValue(name, undefined);
      };
    }
  };

  const handleRemove = () => {
    if (preview && !readonly) {
      URL.revokeObjectURL(preview);
      setPreview(defaultImage || null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      setValue(name, undefined);
    }
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <label className="text-5 leading-5 text-gray-500 font-extrabold mb-3 flex justify-center">
        {label} {requiredStar && <span className="text-red-500">*</span>}
      </label>
      <div className="w-full min-h-fit border-2 border-dashed border-gray-400 rounded-lg flex flex-col gap-4 items-center justify-center bg-white overflow-hidden relative">
        {preview ? (
          <>
            <img
              src={preview}
              alt="Предпросмотр изображения"
              className="w-full object-cover rounded-lg p-1"
              style={{ height: licensePhoto || passportPhoto ? '150px' : '260px' }}
            />
            {!readonly && (
              <IButton
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Удалить
              </IButton>
            )}
          </>
        ) : (
          <LazyImage src={placeholder} alt="Плейсхолдер" className="w-[200px] h-[200px]" />
        )}
        {!readonly && (
          <div className="relative flex flex-col gap-2 pb-4">
            <IButton
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg"
            >
              Загрузить фото
            </IButton>
          </div>
        )}
        {!readonly && (
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            ref={inputRef}
            className="hidden"
          />
        )}
      </div>
      {internalError && <p className="text-red-500 text-center mt-2">{internalError}</p>}
      {error && message && <p className="text-red-500 text-center mt-2">{message}</p>}
    </div>
  );
};

ImageUpload.displayName = 'ImageUpload';
