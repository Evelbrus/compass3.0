import { jsx as _jsx } from "react/jsx-runtime";
//Компонент для пустого скелетона, который сохраняет размеры таблицы (для перехода по страницам)
export const EmptySkeletonTable = ({ rows }) => {
    //Например, предполагаем высоту строки 48px (корректируйте при необходимости)
    const rowHeight = 85;
    const height = rows * rowHeight;
    return _jsx("div", { className: "w-full", style: { height } });
};
