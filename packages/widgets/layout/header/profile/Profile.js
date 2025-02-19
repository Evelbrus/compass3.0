'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { cn } from '@shared/lib';
import Icon from '@shared/components/ui/icon/Icon';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { openModal, setUserFullName, setUserUuid } from '@shared/lib/effector';
const Profile = ({ userSession: userSessionFromProps, onLogout, onNavigate, }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const handleMenuAction = (route) => {
        setIsMenuOpen(false);
        onNavigate?.(route);
    };
    useEffect(() => {
        const handleClick = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        const handleScroll = () => {
            setIsMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (_jsxs("div", { className: "relative", ref: menuRef, children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { onClick: () => setIsMenuOpen(!isMenuOpen), className: cn('w-12 h-12 rounded-full bg-white flex items-center justify-center', 'hover:bg-gray-100 transition-colors'), "aria-label": "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F", "aria-expanded": isMenuOpen, children: _jsx(Icon, { name: "user", alt: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C", className: "w-6 h-6 text-black hover:text-red-500 transition-colors duration-300" }) }), _jsx("span", { className: "text-4 leading-4 font-medium", children: userSessionFromProps?.role
                            ? roleTranslations[userSessionFromProps.role]
                            : 'Неизвестная роль' })] }), isMenuOpen && (_jsxs("div", { className: cn('absolute left-0 mt-2 w-48 bg-white', 'rounded-lg shadow-xl z-50', 'border border-gray-100'), children: [_jsx("div", { className: "px-4 py-2 text-sm text-gray-700 truncate", children: userSessionFromProps?.email || 'Неавторизованный пользователь' }), _jsx("div", { className: "border-t border-gray-100 my-1" }), _jsxs("ul", { className: "flex flex-col gap-1", children: [userSessionFromProps?.uuid && (_jsx("li", { className: "hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm", onClick: () => {
                                    setUserUuid(userSessionFromProps.uuid);
                                    setUserFullName('собственного профиля');
                                    openModal('changePasswordModal');
                                    setIsMenuOpen(false);
                                }, children: "\u0421\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" })), _jsx("li", { className: "hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm text-red-600", onClick: () => {
                                    setIsMenuOpen(false);
                                    onLogout && onLogout();
                                }, children: "\u0412\u044B\u0439\u0442\u0438" })] })] }))] }));
};
export default Profile;
