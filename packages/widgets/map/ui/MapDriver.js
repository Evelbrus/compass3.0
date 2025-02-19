import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
const MapDriver = ({ selectedDriverInfo, serverTime }) => {
    //Преобразуем serverTime в ISO строку или используем текущее время в качестве значения по умолчанию
    const isoServerTime = serverTime
        ? serverTime instanceof Date
            ? serverTime.toISOString()
            : serverTime
        : new Date().toISOString();
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "relative w-full h-full flex flex-col justify-center items-center", children: [selectedDriverInfo && (_jsxs("div", { className: 'absolute flex flex-col top-2 left-2 rounded-md gap-2 z-30', children: [_jsx("label", { className: "text-5 leading-5 font-bold", children: "\u0412\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C:" }), _jsxs("div", { className: "min-w-[500px] bg-blue-200 p-4 border rounded-md flex gap-4 items-center", children: [_jsxs("div", { className: "w-[50px] h-[50px] relative", children: [_jsx(LazyImage, { src: selectedDriverInfo.profilePhotoPath || '/icons/user-driver.svg', alt: "Selected Driver Avatar", className: "w-[50px] h-[50px] rounded-full object-cover bg-white border" }), _jsx("div", { className: `absolute top-0 left-0 w-4 h-4 rounded-full border-2 ${isDriverOnline(selectedDriverInfo.lastActive, isoServerTime)
                                                ? 'bg-green-500'
                                                : 'bg-red-500'}` })] }), _jsxs("div", { children: [_jsx("p", { className: "text-5 leading-5 font-medium", children: selectedDriverInfo.fullName }), _jsx("p", { className: "text-4 leading-4 font-light", children: selectedDriverInfo.phone })] })] })] })), _jsx(LazyImage, { src: "/404.webp", alt: "No Found", className: "w-[350px] h-[300px] object-cover", placeholder: _jsx(Skeleton, { width: 350, height: 300 }) }), _jsx("h2", { className: "text-2xl font-bold text-[color:var(--text-black)] mb-2", children: "\u041A\u0430\u0440\u0442\u0430 \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435" })] }) }));
};
export default MapDriver;
