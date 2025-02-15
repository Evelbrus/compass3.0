'use client';

import React from 'react';
import Cropper from 'react-easy-crop';
import ModalFullImage from '@shared/components/ui/images/ui/ModalFullImage';
import { useImageEditor } from '@shared/components/ui/images/hooks/useImageEditor';

interface ImageUploadWithCropProps {
  //Начальная ссылка на изображение (например, из базы)
  initialSrc?: string | null;

  //Нужно ли показывать, что это обязательное поле, и выводить звёздочку?
  required?: boolean;

  //Ошибка валидации
  error?: boolean;

  //Текст ошибки для отображения
  errorMessage?: string;

  //Колбэк, вызывается при выборе нового файла (чтобы родитель мог сохранить файл в форму)
  onChange?: (file: File | null) => void;

  //Лейбл / подпись к полю
  label?: string;

  //Дополнительные стили / классы, если необходимо
  className?: string;

  //Ширина и высота для контейнера (зависит от ваших нужд)
  containerWidth?: number;
  containerHeight?: number;

  //Используется, если нужно показывать кнопку "Редактировать ракурс"
  aspect?: number;
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
}) => {
  //Подключаем наш хук с редактором изображений
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
  } = useImageEditor(initialSrc, (croppedUrl) => {
    //Когда сохраняем кроп, можно что-то делать (например, передавать наверх)
    //Но чаще нужно просто обновить превью. В хукe это уже делается.
    //Если нужно отдать файл родителю, нужно дополнительно вызвать onChange(...),
    //но там будет Blob, поэтому можно либо конвертировать, либо хранить base64 и т.д.
  });

  //Обёртка, чтобы при смене файла сообщить родителю
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
    //Если нужно тут же «сбрасывать ошибку» — можно это делать:
    //clearErrors('имяПоля');
    //А ещё можно:
    if (onChange) {
      const file = e.target.files?.[0] || null;
      onChange(file);
    }
  };

  //Обёртка для handleRemove, чтобы родитель знал, что мы убрали файл
  const handleRemoveClick = () => {
    handleRemove();
    if (onChange) {
      onChange(null);
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-start p-6 ${className}`}>
      <label className="block text-4 font-medium text-gray-500 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div
        className="w-full border-2 border-dashed border-gray-400 rounded-lg bg-white overflow-hidden relative"
        style={{ height: containerHeight }}
      >
        {localPreview ? (
          <>
            <div className="absolute top-2 left-2 flex flex-row gap-2">
              <button
                type="button"
                onClick={() => setShowFullImage(true)}
                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs"
              >
                Смотреть полностью
              </button>
              <button
                type="button"
                onClick={() => setShowCropper(true)}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 text-xs"
              >
                Редактировать ракурс
              </button>
            </div>
            <div className="absolute top-10 left-2 flex flex-row gap-2">
              <button
                type="button"
                onClick={handleResetCrop}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs"
              >
                Сбросить
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
            <button
              type="button"
              onClick={handleRemoveClick}
              className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 text-xs"
            >
              Удалить
            </button>
          </>
        ) : (
          <img
            src="/placeholderImage.png"
            alt="Плейсхолдер"
            className="object-contain w-full h-full p-8 mx-auto my-auto"
          />
        )}
      </div>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg"
        >
          Загрузить фото
        </button>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {internalError && <p className="text-red-500 text-center mt-2">{internalError}</p>}
      {error && errorMessage && <p className="text-red-500 text-center mt-2">{errorMessage}</p>}

      {showFullImage && localPreview && (
        <ModalFullImage imageSrc={localPreview} onClose={() => setShowFullImage(false)} />
      )}
    </div>
  );
};
