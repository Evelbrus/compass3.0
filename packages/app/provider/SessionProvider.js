'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
import { parseJwt } from '@shared/utils/parse-jwt/parseJwt';
import { resetAccessToken, resetRefreshToken, setAccessToken, setRefreshToken, refreshAccessTokenFx, handleRefreshTokenExpiration, } from '@shared/lib/effector/state/sessionStore';
export const SessionProvider = ({ children, userSession, accessToken, refreshToken, }) => {
    const isFirstRender = useRef(true);
    useEffect(() => {
        //Устанавливаем токены в стор, если они переданы в пропсах
        if (accessToken) {
            setAccessToken(accessToken);
        }
        if (refreshToken) {
            setRefreshToken(refreshToken);
        }
        //Если ни одного токена нет, сбрасываем стор
        if (!accessToken && !refreshToken) {
            resetAccessToken();
            resetRefreshToken();
        }
        if (isFirstRender.current) {
            isFirstRender.current = false;
            //Если есть refreshToken, но нет accessToken – пробуем обновить токены
            if (refreshToken && !accessToken) {
                //Добавляем проверку валидности refresh‑токена перед обновлением
                try {
                    const decodedRefresh = parseJwt(refreshToken);
                    if (!decodedRefresh?.exp || decodedRefresh.exp * 1000 - Date.now() <= 0) {
                        console.warn('[REFRESH] Refresh‑токен истёк');
                        handleRefreshTokenExpiration();
                        return;
                    }
                }
                catch (error) {
                    console.error('Ошибка парсинга refresh‑токена:', error);
                    handleRefreshTokenExpiration();
                    return;
                }
                refreshAccessTokenFx().then((result) => {
                    if (result) {
                        setTimeout(() => {
                            window.location.reload();
                        }, 2500);
                    }
                    else {
                        handleRefreshTokenExpiration();
                    }
                });
            }
            else if (accessToken && !refreshToken) {
                console.warn('[ПРЕДУПРЕЖДЕНИЕ] Обнаружен access‑токен без refresh‑токена. Выполняется logout.');
                handleRefreshTokenExpiration();
            }
        }
    }, [accessToken, refreshToken]);
    return _jsx(SessionContext.Provider, { value: { userSession }, children: children });
};
