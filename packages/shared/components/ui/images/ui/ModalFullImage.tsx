'use client';

import React from 'react';
import { X } from 'lucide-react';

interface ModalFullImageProps {
  imageSrc: string;
  onClose: () => void;
}

const ModalFullImage: React.FC<ModalFullImageProps> = ({ imageSrc, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative">
        <img src={imageSrc} alt="Полное изображение" className="max-w-full max-h-screen" />
        <button
          onClick={onClose}
          className="absolute top-2 left-2 bg-white px-2 py-1 rounded shadow"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
            backdropFilter: 'blur(5px)',
            border: 'none',
          }}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
};

export default ModalFullImage;
