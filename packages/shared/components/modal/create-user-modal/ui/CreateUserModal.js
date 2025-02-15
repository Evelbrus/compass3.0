'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { userCreationOptions } from '@shared/components/modal/create-user-modal';
import { UserRole } from '@prisma/client';
const CreateUserModal = ({ role, onClose }) => {
    const router = useRouter();
    const handleNavigate = (route) => {
        router.push(route);
        onClose();
    };
    const filteredOptions = userCreationOptions.filter((option) => {
        if (role === UserRole.Operator) {
            return option.rolesAllowed.includes(role) && option.id !== 'admin';
        }
        return option.rolesAllowed.includes(role);
    });
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: 'h-full flex flex-col justify-center', children: _jsxs("div", { className: "h-auto overflow-auto bg-white rounded-3xl w-full p-12 relative", children: [_jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsx("h1", { className: "text-3xl font-semibold mb-6 text-center", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F" }), _jsx("div", { className: "flex flex-row flex-wrap gap-4 justify-center", children: filteredOptions.map((option) => (_jsxs("div", { className: "flex flex-col justify-between p-4 border rounded-lg shadow hover:shadow-lg transition duration-300 max-w-[300px] w-full", children: [_jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "w-36 h-36 mb-4 border rounded-md flex items-center justify-center bg-gray-100", children: _jsx("img", { src: option.image, alt: option.title, className: "w-24 h-24" }) }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: option.title }), _jsx("p", { className: "text-sm text-gray-600", children: option.description })] }), _jsx(IButton, { onClick: () => handleNavigate(option.route), className: "mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700", children: option.buttonText })] }, option.id))) })] }) }) }));
};
export default CreateUserModal;
