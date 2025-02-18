import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Icon from '@shared/components/ui/icon/Icon';
import { countryData, validateAndFormatPhone } from '@shared/components/ui/inputs/phone';
import { handleEdit } from '@shared/components/ui/table/handlers/handleEdit';
import { handleDownload } from '@shared/components/ui/table/handlers/handleDownload';
import { handleDelete } from '@shared/components/ui/table/handlers/handleDelete';
import { handleDetail } from '@shared/components/ui/table/handlers/handleDetail';
import { handleOrderDriverDetail } from '@shared/components/ui/table/handlers/drivers/handleOrderDriverDetail';
export const renderActions = ({ entity, uuid, modalType, navigate }) => {
    return (_jsxs("div", { className: "flex", children: [_jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDetail(entity, uuid, navigate), children: _jsx(Icon, { name: "view", alt: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) }), _jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleEdit(entity, uuid, modalType, navigate), children: _jsx(Icon, { name: "edit", alt: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) }), _jsx("div", { className: "p-2 hover:bg-green-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDownload(uuid), children: _jsx(Icon, { name: "download", alt: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C", className: "text-green-500 hover:text-green-700" }) }), _jsx("div", { className: "p-2 hover:bg-red-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDelete(entity, uuid), children: _jsx(Icon, { name: "delete", alt: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", className: "w-6 h-6 text-red-500 hover:text-red-700" }) })] }));
};
export const renderDriverActions = (entity, uuid, navigate) => (_jsx("div", { className: "flex", children: _jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDetail(entity, uuid, navigate), children: _jsx(Icon, { name: "eye-open", alt: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) }) }));
export const renderDateTime = (date) => {
    const formattedDate = new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const formattedTime = new Date(date).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return (_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { children: formattedDate }), _jsx("span", { className: "text-gray-500 text-sm", children: formattedTime })] }));
};
export const renderCustomerPhone = (phone, fullName) => {
    const { isValid, formatted } = validateAndFormatPhone(phone);
    const cleanedPhone = phone.replace(/\D/g, '');
    const country = countryData.find((c) => cleanedPhone.startsWith(c.dialCode.replace('+', '')));
    return (_jsx("div", { className: "flex items-center gap-2", children: _jsxs("div", { className: "flex flex-col items-start", children: [_jsxs("div", { className: "flex flex-row justify-center items-center gap-2", children: [isValid && country && (_jsxs("div", { className: "relative group", children: [_jsx("img", { src: country.flag, alt: country.name, className: "w-6 h-6 object-contain cursor-pointer" }), _jsx("div", { className: "absolute top-full transform mt-1 bg-gray-800 text-white text-xs font-semibold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none", children: country.name })] })), _jsx("span", { children: isValid ? formatted : phone })] }), _jsx("span", { className: "text-gray-500 text-sm", children: fullName })] }) }));
};
export const renderOrderDriverActions = ({ entity, uuid }) => (_jsx("div", { className: "flex", children: _jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleOrderDriverDetail(entity, uuid), children: _jsx(Icon, { name: "view", alt: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) }) }));
export const renderOrdersActions = ({ entity, uuid, modalType, navigate }) => {
    return (_jsxs("div", { className: "flex", children: [entity === 'orders' && (_jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleOrderDriverDetail(entity, uuid), children: _jsx(Icon, { name: "view", alt: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) })), _jsx("div", { className: "p-2 hover:bg-blue-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleEdit(entity, uuid, modalType, navigate), children: _jsx(Icon, { name: "edit", alt: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", className: "w-6 h-6 text-blue-500 hover:text-blue-700" }) }), _jsx("div", { className: "p-2 hover:bg-green-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDownload(uuid), children: _jsx(Icon, { name: "download", alt: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C", className: "relative left-[1.5px] text-green-500 hover:text-green-700" }) }), _jsx("div", { className: "p-2 hover:bg-red-100 rounded-full flex justify-center items-center cursor-pointer transition-colors duration-300", onClick: () => handleDelete(entity, uuid), children: _jsx(Icon, { name: "delete", alt: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", className: "relative left-[1.5px] w-6 h-6 text-red-500 hover:text-red-700" }) })] }));
};
