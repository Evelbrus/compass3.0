'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from '@shared/hooks';
import { cn } from '@shared/lib';
const extractSizeFromClassName = (className, prefix, fallbackPrefix) => {
    if (!className)
        return undefined;
    const primaryRegex = new RegExp(`${prefix}-\\[(\\d+)px\\]`);
    const primaryMatch = className.match(primaryRegex);
    if (!primaryMatch) {
        const fallbackRegex = new RegExp(`${fallbackPrefix}-\\[(\\d+)px\\]`);
        const fallbackMatch = className.match(fallbackRegex);
        return fallbackMatch ? parseInt(fallbackMatch[1], 10) : undefined;
    }
    return parseInt(primaryMatch[1], 10);
};
export const LazyImage = ({ src, alt, quality, blurDataURL, priority, sizes, placeholder, className, enableHoverEffect = false, overlay = false, overlayClassName = 'rounded-xl absolute top-0 left-0 w-full h-full bg-[#ffffff54] transition-colors duration-300 z-[1] group-hover:bg-transparent', position = 'relative', }) => {
    const [imageRef, isVisible] = useIntersectionObserver({
        threshold: 0.1,
    });
    const [isMobile, setIsMobile] = useState(true);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const width = extractSizeFromClassName(className, isMobile ? 'w' : 'md:w', 'w');
    const height = extractSizeFromClassName(className, isMobile ? 'h' : 'md:h', 'h');
    if (!width || !height) {
        console.error(`LazyImage Error: Не удалось определить width/height для изображения "${src}". Убедитесь, что классы w-[*px] и h-[*px] переданы корректно.`);
    }
    return (_jsx("div", { ref: imageRef, className: `${position} select-none overflow-hidden`, children: isVisible ? (_jsxs(_Fragment, { children: [_jsx(Image, { src: src, alt: alt, quality: quality || 80, width: width, height: height, blurDataURL: blurDataURL, ...(priority ? { priority } : {}), className: cn(className, enableHoverEffect && 'transition-transform duration-500 ease-in-out hover:scale-110'), sizes: sizes }), overlay && _jsx("div", { className: overlayClassName })] })) : (placeholder) }));
};
