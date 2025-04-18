'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { breadcrumbsMap, privateRoutes } from '@shared/utils/routing';
import Link from 'next/link';

const Profile = dynamic(() => import('@widgets/layout/header/profile/Profile'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
});

const Notification = dynamic(() => import('@widgets/layout/header/notification/Notification'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
});

interface HeaderContainerProps {
  userSession?: UserSession | null;
}

const matchRoutePattern = (actualPath: string, routePattern: string): boolean => {
  const patternParts = routePattern.split('/');
  const pathParts = actualPath.split('/');

  if (patternParts.length !== pathParts.length) {
    return false;
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart === undefined || pathPart === undefined) {
      return false;
    }

    if (patternPart.startsWith(':')) {
      continue;
    }

    if (patternPart !== pathPart) {
      return false;
    }
  }

  return true;
};

const findMatchingRoute = (actualPath: string): string | null => {
  for (const routeKey in privateRoutes) {
    const routePattern = privateRoutes[routeKey as keyof typeof privateRoutes];
    if (matchRoutePattern(actualPath, routePattern)) {
      return routePattern;
    }
  }
  return null;
};

const HeaderContainer: React.FC<HeaderContainerProps> = ({ userSession }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const [_isLoggingOut, setIsLoggingOut] = useState(false);

  const breadcrumbs = useMemo(() => {
    const matchedPattern = findMatchingRoute(pathname) || pathname;
    const breadcrumbData = breadcrumbsMap[matchedPattern as keyof typeof breadcrumbsMap];

    if (breadcrumbData) {
      return breadcrumbData.map((item, index) => {
        const effectivePath =
          (item.path.includes(':id') || item.path.includes(':role')) &&
          index === breadcrumbData.length - 1
            ? pathname
            : item.path;
        return {
          label: item.title,
          path: effectivePath,
          description: item.description,
          isLast: index === breadcrumbData.length - 1,
        };
      });
    }

    return [
      {
        label: 'Главная',
        path: '/',
        description: 'Главная страница приложения',
        isLast: true,
      },
    ];
  }, [pathname]);

  const handleNavigate = (route: string | undefined) => {
    if (!route || route.includes(':id') || route.includes(':role')) {
      console.warn('Invalid route provided to handleNavigate:', route);
      return;
    }
    router.prefetch(route);
    router.push(route);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка при выходе');
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const visibleBreadcrumbs = breadcrumbs.filter((item) => item.label !== '');
  const lastBreadcrumb =
    visibleBreadcrumbs.length > 0 ? visibleBreadcrumbs[visibleBreadcrumbs.length - 1] : null;

  return (
    <div className="w-full flex flex-row justify-between items-center h-[100px] max-h-[100px] border-b bg-white z-20 px-4">
      <div className="flex flex-col gap-1">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex items-center flex-wrap">
            <div className={'flex flex-row gap-2'}>
              <span>Страница:</span>
              {visibleBreadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <span className="text-gray-400 select-none">/</span>}
                  {item.isLast ? (
                    <span className="font-medium text-indigo-600">{item.label}</span>
                  ) : (
                    <Link
                      href={item.path}
                      className="text-gray-600 hover:text-indigo-600 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigate(item.path);
                      }}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </div>
          </ol>
          {lastBreadcrumb && (
            <div className="mt-1">
              <span className="text-3xl font-bold text-black block">{lastBreadcrumb.label}</span>
              <span className="text-gray-700 block">{lastBreadcrumb.description}</span>
            </div>
          )}
        </nav>
      </div>

      <div className="flex flex-row items-center gap-4">
                <Notification userSession={userSession} />
        <Profile userSession={userSession} onLogout={logout} onNavigate={handleNavigate} />
      </div>
    </div>
  );
};

export default HeaderContainer;
