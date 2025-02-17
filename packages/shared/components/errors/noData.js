import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
const NoData = ({ message }) => {
    return (_jsx(AnimatedComponent, { className: "w-full h-[510px] max-h-[510px] bg-white rounded-xl border", duration: 500, children: _jsxs("div", { className: "w-full h-full flex flex-col justify-center items-center", children: [_jsx(LazyImage, { src: "/404.webp", alt: "No Found", className: "w-[350px] h-[300px] object-cover", placeholder: _jsx(Skeleton, { width: 350, height: 300 }) }), _jsx("h2", { className: "text-2xl font-bold text-[color:var(--text-black)] mb-2", children: message || 'Пока что данных нет' })] }) }));
};
export default NoData;
