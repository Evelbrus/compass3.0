import { jsx as _jsx } from "react/jsx-runtime";
import Icon from '@shared/components/ui/icon/Icon';
import { privateRoutes } from '@shared/utils/routing';
export const navItems = [
    {
        label: 'Главная',
        href: privateRoutes.HOME,
        icon: (_jsx(Icon, { name: "dashboard", alt: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Заказы',
        href: privateRoutes.ORDERS,
        icon: (_jsx(Icon, { name: "shopping-cart", alt: "\u041A\u043E\u0440\u0437\u0438\u043D\u0430", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Управления тарифами',
        href: privateRoutes.TARIFFMANAGEMENT,
        icon: (_jsx(Icon, { name: "database", alt: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0442\u0430\u0440\u0438\u0444\u0430\u043C\u0438", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Управления автомобилями',
        href: privateRoutes.TRANSFERSERVICES,
        icon: (_jsx(Icon, { name: "truck", alt: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044F\u043C\u0438", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Водители',
        href: privateRoutes.DRIVERS,
        icon: (_jsx(Icon, { name: "user", alt: "\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u0438", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Клиенты',
        href: privateRoutes.USERS,
        icon: (_jsx(Icon, { name: "users", alt: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Администратор',
        href: privateRoutes.ADMIN,
        icon: (_jsx(Icon, { name: "users-settings", alt: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Настройки',
        href: privateRoutes.SETTINGS,
        icon: (_jsx(Icon, { name: "settings", alt: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Карта',
        href: privateRoutes.MAP,
        icon: (_jsx(Icon, { name: "map", alt: "\u041A\u0430\u0440\u0442\u0430", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
    {
        label: 'Справочники',
        href: privateRoutes.REFERENCEBOOK,
        icon: (_jsx(Icon, { name: "settings", alt: "\u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438", className: "w-6 h-6 text-current transition-colors duration-300" })),
    },
];
