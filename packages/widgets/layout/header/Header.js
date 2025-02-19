import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense } from 'react';
import { StaticHeader } from '@entities/layout/header/static-header';
import HeaderContainer from '@widgets/layout/header/HeaderContainer';
const Header = ({ userSession }) => {
    return (_jsx("div", { className: "flex flex-col relative", children: _jsx(StaticHeader, { additionalContent: _jsx(Suspense, { fallback: _jsx(HeaderIslandsSkeleton, {}), children: _jsx(HeaderContainer, { userSession: userSession }) }) }) }));
};
export default Header;
const HeaderIslandsSkeleton = () => {
    return (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full animate-pulse" }), _jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full animate-pulse" })] }));
};
