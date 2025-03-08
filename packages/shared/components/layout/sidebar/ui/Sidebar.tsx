'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { NavItem, navItems, SidebarProps } from '@shared/components/layout/sidebar';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { $currentPage, setCurrentPage } from '@shared/lib/effector';
import { PrivatePageType, privateRoutes } from '@shared/utils/routing';
import { rolePagesMap } from '@shared/utils/routing/private/rolePagesMap';

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = useUnit($currentPage);

  // При маунте определяем, какой ключ соответствует данному pathname
  useEffect(() => {
    const currentPathKey = Object.keys(privateRoutes).find(
      (key) => privateRoutes[key as PrivatePageType] === pathname,
    ) as PrivatePageType | undefined;

    if (currentPathKey && currentPathKey !== currentPage) {
      setCurrentPage(currentPathKey);
    }
  }, [pathname, currentPage]);

  // Переходим по реальным путям
  const handleNavigation = (key: PrivatePageType) => {
    if (key !== currentPage) {
      router.push(privateRoutes[key]);
    }
  };

  // Определяем доступные страницы по роли
  const allowedPages = role ? rolePagesMap[role] : [];

  // Получаем разрешенные пути
  const allowedHrefs = allowedPages.map((pageType) => privateRoutes[pageType as PrivatePageType]);

  // Фильтруем навигационные элементы
  const filteredNavItems = navItems.filter((item: NavItem) => allowedHrefs.includes(item.href));

  return (
    <aside className="hidden md:block lg:block h-full text-white z-50 bg-transparent">
      {/* При клике переходим на главную */}
      <div
        onClick={() => handleNavigation('HOME')}
        className="flex items-center justify-start w-full h-[100px] p-4 cursor-pointer"
      >
        <LazyImage
          src="/compassLogo.svg"
          alt="logotype"
          className="w-[118px] h-[39px] object-cover"
          placeholder={<Skeleton width={172} height={48} />}
        />
      </div>

      <nav className="px-5 py-8 border-y border-gray-300">
        <ul className="flex flex-col gap-8">
          {filteredNavItems.map((item: NavItem) => {
            // Получаем текущий путь
            const currentPath = currentPage ? privateRoutes[currentPage] : '';
            const isActive = currentPath === item.href;

            return (
              <li key={item.href}>
                <IButton
                  href={item.href}
                  className={`flex flex-row items-center gap-3 text-4 leading-4 font-bold button-hover-icon ${
                    isActive
                      ? 'text-black font-bold hover:text-black is-active'
                      : 'text-[#4B5664] font-light hover:text-black'
                  }`}
                  buttonPrefix={item.icon}
                  onClick={(e) => {
                    e.preventDefault();
                    // Находим ключ по пути
                    const key = Object.keys(privateRoutes).find(
                      (k) => privateRoutes[k as PrivatePageType] === item.href,
                    ) as PrivatePageType | undefined;

                    if (key) {
                      handleNavigation(key);
                    } else {
                      console.warn(`Не найден ключ маршрута для href: ${item.href}`);
                    }
                  }}
                >
                  {item.label}
                </IButton>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
