'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import { showToast } from '@shared/components/toast/ToastManager';
import { CloseIcon } from '@shared/components/ui/icon';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import ModalContent from './order-info-modal/OrderInfo';
const OrderCreateWidget = ({ onSubmit, handleUpdatePrice, price, selectedDeparturePoint, selectedArrivalPoint, selectedIntermediatePoints, selectedTariff, selectedClientInfo, selectedDriverInfo, freeWaitTime, waitingTimeMinutes, extraWaitingTimeCost, selectedAdditionalServices, isEditingProp, }) => {
    const { setValue, handleSubmit, formState, trigger, watch } = useFormContext();
    const [editedPrice, setEditedPrice] = useState(null);
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const inputRef = useRef(null);
    const [selectedStatus, setSelectedStatus] = useState(orderStatusOptions[0].value);
    const [isEditingLocal, setIsEditingLocal] = useState(false);
    const calculatedPrice = price || 0;
    const departureTime = watch('departureTime');
    const flightNumber = watch('flightNumber');
    const description = watch('description');
    useEffect(() => {
        if (!isEditingLocal) {
            setEditedPrice(null);
        }
    }, [isEditingLocal]);
    const handleEditClick = () => {
        setEditedPrice(calculatedPrice);
        setIsEditingLocal(true);
    };
    const handleReturnToCalculatedPrice = () => {
        setEditedPrice(null);
        setValue('basePrice', calculatedPrice);
        setIsEditingLocal(false);
        handleUpdatePrice();
    };
    //Исправленная функция: тип параметра теперь включает bigint и null
    const handlePriceChange = (value) => {
        if (value === null) {
            //Если значение null, устанавливаем цену в 0 (или можно оставить предыдущую цену)
            setEditedPrice(null);
            setValue('basePrice', 0);
            return;
        }
        const newPrice = Number(value);
        setEditedPrice(newPrice);
        setValue('basePrice', newPrice);
    };
    const handleUpdatePriceClick = useCallback(() => {
        if (isEditingLocal) {
            return;
        }
        setIsUpdatingPrice(true);
        handleUpdatePrice();
        showToast.success('Цена обновлена');
        setTimeout(() => {
            setIsUpdatingPrice(false);
        }, 1000);
    }, [handleUpdatePrice, isEditingLocal]);
    const handleOpenModal = async () => {
        const isValid = await trigger();
        if (!isValid) {
            showToast.error('Пожалуйста, заполните все обязательные поля.');
            return;
        }
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleCreateOrder = () => {
        handleSubmit((data) => {
            console.log('Data before sending:', data);
            const orderData = {
                ...data,
                basePrice: Number(data.basePrice),
                status: selectedStatus,
            };
            console.log('Order data before onSubmit:', orderData);
            onSubmit(orderData);
            setIsModalOpen(false);
        })();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("form", { onSubmit: (e) => {
                    e.preventDefault();
                    handleOpenModal();
                }, className: "flex flex-col items-end gap-4 p-4 border rounded-md bg-white", children: [isEditingProp && (_jsxs("div", { className: "flex flex-col items-end gap-2 w-full", children: [_jsx("label", { className: "text-sm", children: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsx("select", { value: selectedStatus, onChange: (e) => setSelectedStatus(e.target.value), className: "border rounded p-2 w-full", children: orderStatusOptions.map((statusOption) => (_jsx("option", { value: statusOption.value, children: statusOption.label }, statusOption.value))) })] })), _jsxs("div", { className: "flex flex-col items-end gap-2", children: [_jsx("span", { children: "\u0418\u0442\u043E\u0433\u043E\u0432\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430:" }), _jsxs("div", { className: "flex flex-row gap-2", children: [_jsx(TextInput, { type: "number", value: String(isEditingLocal
                                            ? editedPrice !== null
                                                ? editedPrice
                                                : calculatedPrice
                                            : calculatedPrice), readOnly: !isEditingLocal, onChange: handlePriceChange, ref: inputRef }), !isEditingLocal && (_jsx(IButton, { onClick: handleUpdatePriceClick, disabled: isUpdatingPrice, className: `bg-gray-400 rounded-md p-2 text-white flex items-center justify-center min-w-[40px] ${isUpdatingPrice ? 'opacity-50 cursor-not-allowed' : ''}`, children: _jsx("div", { className: `rounded-full h-4 w-4 border-t-2 border-b-2 border-white ${isUpdatingPrice ? 'animate-spin' : ''}` }) }))] }), _jsxs("div", { className: "w-full flex flex-row justify-end gap-2", children: [!isEditingLocal && (_jsx(IButton, { onClick: handleEditClick, className: "bg-[#001659] rounded-md p-2 text-white", children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C" })), isEditingLocal && (_jsx(IButton, { onClick: handleReturnToCalculatedPrice, className: "bg-green-600 rounded-md p-2 text-white", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u043D\u043E\u0439 \u0446\u0435\u043D\u0435" }))] })] }), formState.errors.basePrice?.message && (_jsx("span", { className: "text-red-500", children: formState.errors.basePrice.message })), _jsx(IButton, { type: "submit", onClick: handleUpdatePriceClick, className: 'w-[371px] bg-[#2A3037] text-white rounded-md p-4', children: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C" })] }), isModalOpen && (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50", children: _jsxs("div", { className: "bg-white rounded-md w-[800px] flex flex-col p-12 max-h-[90vh] overflow-y-auto relative", children: [_jsx(IButton, { variant: "close", onClick: handleCloseModal, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full", children: _jsx(CloseIcon, {}) }), _jsx("h2", { className: "text-2xl font-bold mb-4 text-center", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsx(ModalContent, { selectedStatus: selectedStatus, selectedDeparturePoint: selectedDeparturePoint, selectedArrivalPoint: selectedArrivalPoint, selectedIntermediatePoints: selectedIntermediatePoints, selectedTariff: selectedTariff, departureTime: departureTime ?? '', flightNumber: flightNumber ?? '', description: description ?? '', selectedClientInfo: selectedClientInfo, selectedDriverInfo: selectedDriverInfo, freeWaitTime: freeWaitTime ?? 0, waitingTimeMinutes: waitingTimeMinutes, extraWaitingTimeCost: extraWaitingTimeCost, selectedAdditionalServices: selectedAdditionalServices, price: price }), _jsxs("div", { className: "flex justify-end gap-4 mt-4", children: [_jsx(IButton, { onClick: handleCloseModal, className: "p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", children: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F" }), _jsx(IButton, { onClick: handleCreateOrder, className: "p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437" })] })] }) }))] }));
};
export default OrderCreateWidget;
