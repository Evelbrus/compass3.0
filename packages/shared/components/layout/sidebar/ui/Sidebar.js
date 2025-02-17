'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { navItems } from '@shared/components/layout/sidebar';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { $currentPage, setCurrentPage } from '@shared/lib/effector';
import { privateRoutes, publicRoutes, } from '@shared/utils/routing';
import { rolePagesMap } from '@shared/utils/routing/private/rolePagesMap';
const Sidebar = ({ role }) => {
    const pathname = usePathname();
    const router = useRouter();
    const currentPage = useUnit($currentPage);
    //При маунте определяем, какой ключ (например 'HOME') соответствует данному pathname
    useEffect(() => {
        const currentPathKey = Object.keys(privateRoutes).find((key) => privateRoutes[key] === pathname);
        if (currentPathKey && currentPathKey !== currentPage) {
            setCurrentPage(currentPathKey);
        }
    }, [pathname, currentPage]);
    //Переходим по реальным путям privateRoutes[key], а не строке "HOME"
    const handleNavigation = (key) => {
        if (key !== currentPage) {
            router.push(privateRoutes[key]);
        }
    };
    //Определяем, какие страницы доступны по роли; получаем массив реальных путей
    const allowedPages = role ? rolePagesMap[role] : [];
    const allowedHrefs = allowedPages.map((pageType) => privateRoutes[pageType] || publicRoutes[pageType]);
    //Фильтруем навигационные элементы, сохраняя только те, что есть в allowedHrefs
    const filteredNavItems = navItems.filter((item) => allowedHrefs.includes(item.href));
    return (_jsxs("aside", { className: "hidden md:block lg:block max-w-[200px] w-[200px] text-white flex-shrink-0 z-50", children: [_jsx("div", { onClick: () => handleNavigation('HOME'), className: "flex w-full h-[70px] p-4 cursor-pointer", children: _jsx(LazyImage, { src: "/compassLogo.svg", alt: "logotype", className: "w-[118px] h-[39px] object-cover", placeholder: _jsx(Skeleton, { width: 172, height: 48 }) }) }), _jsx("nav", { className: "px-5 py-8 border-y border-gray-300", children: _jsx("ul", { className: "flex flex-col gap-8", children: filteredNavItems.map((item) => {
                        //Сравниваем реальные пути: например '/' === '/'
                        const currentPath = privateRoutes[currentPage] || '';
                        const isActive = currentPath === item.href;
                        return (_jsx("li", { children: _jsx(IButton, { href: item.href, className: `flex flex-row items-center gap-3 text-4 leading-4 font-bold button-hover-icon ${isActive
                                    ? 'text-black font-bold hover:text-black is-active'
                                    : 'text-[#4B5664] font-light hover:text-black'}`, buttonPrefix: item.icon, onClick: () => {
                                    //Находим ключ (например 'HOME') из privateRoutes, соответствующий item.href
                                    const key = Object.keys(privateRoutes).find((k) => privateRoutes[k] === item.href) || undefined;
                                    if (key) {
                                        handleNavigation(key);
                                    }
                                    else {
                                        console.warn(`Не найден ключ маршрута для href: ${item.href}`);
                                    }
                                }, children: item.label }) }, item.href));
                    }) }) })] }));
};
export default Sidebar;
