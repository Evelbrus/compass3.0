'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { NavItem, navItems, SidebarProps } from '@shared/components/layout/sidebar';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { $currentPage, setCurrentPage } from '@shared/lib/effector';
import {
  PrivatePageType,
  privateRoutes,
  PublicPageType,
  publicRoutes,
} from '@shared/utils/routing';
import { rolePagesMap } from '@shared/utils/routing/private/rolePagesMap';
import { UserRole } from '@prisma/client';

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const router = useRouter();
  const currentPage = useUnit($currentPage);

  //При маунте определяем, какой ключ (например 'HOME') соответствует данному pathname
  useEffect(() => {
    const currentPathKey = Object.keys(privateRoutes).find(
      (key) => privateRoutes[key as PrivatePageType] === pathname,
    ) as PrivatePageType | undefined;

    if (currentPathKey && currentPathKey !== currentPage) {
      setCurrentPage(currentPathKey);
    }
  }, [pathname, currentPage]);

  //Переходим по реальным путям privateRoutes[key], а не строке "HOME"
  const handleNavigation = (key: PrivatePageType) => {
    if (key !== currentPage) {
      router.push(privateRoutes[key]);
    }
  };

  //Определяем, какие страницы доступны по роли; получаем массив реальных путей
  const allowedPages = role ? rolePagesMap[role] : [];
  const allowedHrefs = allowedPages.map(
    (pageType) =>
      privateRoutes[pageType as PrivatePageType] || publicRoutes[pageType as PublicPageType],
  );

  //Фильтруем навигационные элементы, сохраняя только те, что есть в allowedHrefs
  const filteredNavItems = navItems.filter((item: NavItem) => allowedHrefs.includes(item.href));

  return (
    <aside className="hidden md:block lg:block max-w-[200px] w-[200px] text-white flex-shrink-0 z-50">
      {/*При клике передаём ключ 'HOME', чтобы router.push ходил на privateRoutes.HOME */}
      <div
        onClick={() => handleNavigation('HOME')}
        className="flex w-full h-[70px] p-4 cursor-pointer"
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
            //Сравниваем реальные пути: например '/' === '/'
            const currentPath = privateRoutes[currentPage as PrivatePageType] || '';
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
                  onClick={() => {
                    //Находим ключ (например 'HOME') из privateRoutes, соответствующий item.href
                    const key =
                      (Object.keys(privateRoutes).find(
                        (k) => privateRoutes[k as PrivatePageType] === item.href,
                      ) as PrivatePageType) || undefined;

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

      {/*{role !== UserRole.Client && role !== UserRole.ClientCorp && (*/}
      {/*<div className="flex justify-center text-sm my-2">*/}
      {/*<IButton*/}
      {/*type="button"*/}
      {/*className="relative text-sm text-right text-black hover:underline"*/}
      {/*badge={5}*/}
      {/*badgeClassName="top-[-15px] right-[-25px] text-white bg-black"*/}
      {/*aria-label="Notifications"*/}
      {/*>*/}
      {/*Водители на линии*/}
      {/*</IButton>*/}
      {/*</div>*/}
      {/*)}*/}
    </aside>
  );
};

export default Sidebar;
