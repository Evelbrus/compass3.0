import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useUnit } from 'effector-react';
import { $entityToDelete, closeModal, triggerUpdate } from '@shared/lib/effector';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
const DeleteModal = ({ onClose }) => {
    const entityToDelete = useUnit($entityToDelete);
    console.log('entityToDelete', entityToDelete);
    const handleDelete = async () => {
        if (!entityToDelete)
            return;
        let apiPath = '';
        let successMessage = '';
        let errorMessage = '';
        switch (entityToDelete.entity) {
            case 'orders':
                apiPath = `/api/orders/${entityToDelete.uuid}`;
                successMessage = 'Заказ успешно удалён!';
                errorMessage = 'Ошибка при удалении заказа.';
                break;
            case 'vehicles':
                apiPath = `/api/vehicles/${entityToDelete.uuid}`;
                successMessage = 'Машина успешно удалена!';
                errorMessage = 'Ошибка при удалении машины.';
                break;
            case 'users':
                apiPath = `/api/users/${entityToDelete.uuid}`;
                successMessage = 'Пользователь успешно удалён!';
                errorMessage = 'Ошибка при удалении пользователя.';
                break;
            default:
                console.error(`Неизвестный тип сущности: ${entityToDelete.entity}`);
                return;
        }
        try {
            const response = await fetch(apiPath, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uuid: entityToDelete.uuid }),
            });
            if (response.ok) {
                showToast.success(successMessage);
                triggerUpdate(); //Триггерим обновление данных
            }
            else {
                const errorData = await response.json();
                const errorMessageFromServer = errorData?.error || response.statusText;
                showToast.error(errorMessageFromServer || errorMessage);
                console.error(`Ошибка удаления ${entityToDelete.entity}:`, errorMessageFromServer || response.status);
                return;
            }
        }
        catch (error) {
            console.error(`Ошибка удаления ${entityToDelete.entity}:`, error);
            showToast.error(errorMessage);
        }
        finally {
            closeModal();
        }
    };
    if (!entityToDelete)
        return null;
    const entityText = {
        orders: { name: 'заказ', text: 'заказа' },
        vehicles: { name: 'машина', text: 'машины' },
        users: { name: 'пользователя', text: 'пользователя' },
    };
    const currentEntityText = entityText[entityToDelete.entity] || {
        name: 'сущность',
        text: 'сущности',
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50", children: _jsx(AnimatedComponent, { duration: 500, children: _jsxs("div", { className: "relative flex flex-col justify-between bg-white rounded-3xl w-[500px] max-w-[500px] gap-2", children: [_jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full", children: _jsx(CloseIcon, {}) }), _jsx("h1", { className: "text-lg text-center font-semibold p-4 border-b border-gray-300", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435" }), _jsxs("div", { className: "flex flex-col items-center p-4 gap-4", children: [_jsxs("h2", { className: "text-lg text-center font-semibold", children: ["\u0412\u044B \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C ", currentEntityText.name, "?"] }), _jsxs("p", { className: "text-center justify-center max-w-[400px]", children: ["\u041F\u0440\u0438 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u0438 ", currentEntityText.text, " \u0435\u0433\u043E \u043D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u0431\u0443\u0434\u0435\u0442 \u0432\u0435\u0440\u043D\u0443\u0442\u044C, \u0438 \u0434\u0430\u043D\u043D\u044B\u0435 \u0431\u0443\u0434\u0443\u0442 \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u043F\u043E\u0442\u0435\u0440\u044F\u043D\u044B."] })] }), _jsxs("div", { className: "flex mt-4 justify-center rounded-t rounded-3xl", children: [_jsx(IButton, { onClick: onClose, className: "px-8 py-4 bg-gray-500 border-x border-white text-white rounded-tl-2xl rounded-none hover:bg-gray-700", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx(IButton, { onClick: handleDelete, className: "px-8 py-4 bg-red-500 border-x border-white text-white rounded-tr-2xl rounded-none hover:bg-red-700", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }) }) }));
};
export default DeleteModal;
