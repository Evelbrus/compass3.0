'use client';
import { useState, useRef } from 'react';
import { getCroppedImg } from '@shared/components/ui/images/utils/cropImage';
export const useImageEditor = (initialImage, setPreviewCallback) => {
    const [originalPreview, setOriginalPreview] = useState(initialImage || null);
    const [localPreview, setLocalPreview] = useState(initialImage || null);
    const [internalError, setInternalError] = useState(null);
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showFullImage, setShowFullImage] = useState(false);
    const inputRef = useRef(null);
    const handleImageChange = (e) => {
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
    const onCropComplete = (_unused, croppedAreaPixels) => {
        setCroppedAreaPixels({
            x: Math.round(croppedAreaPixels.x),
            y: Math.round(croppedAreaPixels.y),
            width: Math.round(croppedAreaPixels.width),
            height: Math.round(croppedAreaPixels.height),
        });
    };
    const handleCropSave = async () => {
        console.log('Current zoom:', zoom);
        if (originalPreview && croppedAreaPixels) {
            try {
                const croppedImageUrl = await getCroppedImg(originalPreview, croppedAreaPixels);
                setLocalPreview(croppedImageUrl);
                if (setPreviewCallback) {
                    setPreviewCallback(croppedImageUrl);
                }
                setZoom(1);
                setShowCropper(false);
            }
            catch (error) {
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
