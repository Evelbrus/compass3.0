import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
const Map = () => {
    return (_jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center", children: [_jsx(LazyImage, { src: "/404.webp", alt: "No Found", className: "w-[350px] h-[300px] object-cover", placeholder: _jsx(Skeleton, { width: 350, height: 300 }) }), _jsx("h2", { className: "text-2xl font-bold text-[color:var(--text-black)] mb-2", children: "\u041A\u0430\u0440\u0442\u0430 \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435" }), _jsx(Link, { href: "/", className: "px-6 py-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-md hover:bg-[color:var(--button-secondary-hover)] transition", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E" })] }));
};
export default Map;
