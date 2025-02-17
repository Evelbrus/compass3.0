'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { cn } from '@shared/lib';
const AnimatedComponent = ({ children, className, duration = 500, visible = true, }) => {
    const [animationStart, setAnimationStart] = useState(false);
    useEffect(() => {
        setAnimationStart(visible);
    }, [visible]);
    return (_jsx("div", { className: cn(`transition-opacity duration-${duration}`, animationStart ? 'opacity-100' : 'opacity-0', className), children: children }));
};
export default AnimatedComponent;
