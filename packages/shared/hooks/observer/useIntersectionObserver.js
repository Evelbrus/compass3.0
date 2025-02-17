'use client';
import { useState, useEffect, useRef } from 'react';
export function useIntersectionObserver(options) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.isIntersecting) {
                setIsVisible(true);
                observer.disconnect();
            }
        }, {
            root: options?.root || null,
            rootMargin: options?.rootMargin || '0px',
            threshold: options?.threshold || 0.1,
        });
        if (elementRef.current) {
            observer.observe(elementRef.current);
        }
        return () => {
            if (elementRef.current) {
                observer.unobserve(elementRef.current);
            }
        };
    }, [options]);
    return [elementRef, isVisible];
}
