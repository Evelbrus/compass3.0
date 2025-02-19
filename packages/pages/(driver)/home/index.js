import { jsx as _jsx } from "react/jsx-runtime";
import HeroSection from '@pages/(driver)/home/hero-section/ui/HeroSection';
const HomeDriverPage = () => {
    return (_jsx("div", { className: 'max-w-[1920px] min-h-[calc(100vh-80px)] p-5', children: _jsx(HeroSection, {}) }));
};
export default HomeDriverPage;
