'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
const ClientSelector = ({ clients, searchClient, handleSearchChange, selectedClientInfo, setSelectedClientInfo, loadMore, total, }) => {
    const { control, formState, setValue, reset } = useFormContext();
    const [isNewClientMode, setIsNewClientMode] = useState(false);
    const [phoneValue, setPhoneValue] = useState('');
    const loaderRef = useRef(null);
    const isLoadingRef = useRef(false);
    const [isOpen, setIsOpen] = useState(false);
    //Определение, достигли ли конца списка
    const isAtLastPage = useMemo(() => clients && total > 0 && clients.length >= total, [clients, total]);
    const handleToggleClientMode = () => {
        setIsNewClientMode((prev) => !prev);
        reset({
            fullName: '',
            phone: '',
            createdBy: undefined,
        }, {
            keepErrors: false,
            keepDirty: false,
            keepIsSubmitted: false,
        });
        setPhoneValue('');
        setSelectedClientInfo(null);
    };
    useEffect(() => {
        setPhoneValue(selectedClientInfo?.phone || '');
    }, [selectedClientInfo]);
    const handleClientSelection = useCallback((client) => {
        setSelectedClientInfo(client);
        setValue('createdBy', client.uuid, { shouldValidate: true });
        setPhoneValue(client.phone || '');
        setIsOpen(false);
    }, [setSelectedClientInfo, setValue]);
    //IntersectionObserver
    useEffect(() => {
        const observerCallback = (entries) => {
            const [entry] = entries;
            if (entry.isIntersecting && !isLoadingRef.current && !isAtLastPage) {
                isLoadingRef.current = true;
                loadMore();
            }
        };
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5,
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }
        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [loadMore, isAtLastPage]);
    //Сброс состояния загрузки
    useEffect(() => {
        isLoadingRef.current = false;
    }, [clients]);
    //Обработка клика вне области селектора
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (isOpen && !target.closest('.client-selector')) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);
    const clientOptions = useMemo(() => {
        return (clients?.map((client) => ({
            label: client.fullName,
            value: client.uuid,
            key: client.uuid,
        })) || []);
    }, [clients]);
    const validateSelection = useCallback((selectedClient, options) => {
        if (selectedClient && !options.some((opt) => opt.value === selectedClient.uuid)) {
            setValue('createdBy', '');
            setSelectedClientInfo(null);
            setPhoneValue('');
        }
    }, [setValue, setSelectedClientInfo, setPhoneValue]);
    useEffect(() => {
        validateSelection(selectedClientInfo, clientOptions);
    }, [clientOptions, selectedClientInfo, validateSelection]);
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "w-full flex justify-between items-center", children: [_jsx("h1", { className: 'block text-6 leading-6 font-bold', children: "\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430" }), _jsx("button", { type: "button", className: `min-w-[200px] p-3 rounded transition-colors text-4 leading-4 text-white ${isNewClientMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'}`, onClick: handleToggleClientMode, children: isNewClientMode ? 'Поиск клиентов' : 'Новый клиент' })] }), _jsx("div", { className: 'border' }), _jsxs("div", { className: "w-full flex items-start justify-between gap-4", children: [_jsxs("div", { className: "w-full flex flex-col", children: [_jsx("label", { className: "block mb-4 text-5 leading-5 font-bold", children: isNewClientMode ? 'Телефон клиента:' : 'Номер клиента:' }), isNewClientMode ? (_jsx(Controller, { name: "phone", control: control, defaultValue: "", rules: { required: 'Введите номер телефона' }, render: ({ field, fieldState }) => (_jsx("input", { ...field, type: "tel", value: field.value || phoneValue, placeholder: "+7 (999) 999-99-99", className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}` })) })) : (_jsx("input", { value: phoneValue || '', readOnly: true, placeholder: "\u041D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D", className: "w-full p-3 bg-white rounded border border-gray-300 text-black text-4 leading-4" })), isNewClientMode && formState.errors.phone && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: formState.errors.phone.message }))] }), _jsxs("div", { className: `w-full flex flex-col client-selector`, children: [_jsx("label", { className: "block mb-4 text-5 leading-5 font-bold", children: isNewClientMode ? 'Создание клиента:' : 'Клиент:' }), isNewClientMode ? (_jsx(_Fragment, { children: _jsx(Controller, { name: "fullName", control: control, defaultValue: "", rules: { required: 'Введите ФИО клиента' }, render: ({ field, fieldState }) => (_jsx("input", { ...field, type: "text", value: field.value || '', placeholder: "\u0418\u0432\u0430\u043D\u043E\u0432 \u0418\u0432\u0430\u043D \u0418\u0432\u0430\u043D\u043E\u0432\u0438\u0447", className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}` })) }) })) : (_jsx(Controller, { name: "createdBy", control: control, defaultValue: undefined, rules: { required: 'Выберите клиента' }, render: ({ field, fieldState }) => (_jsxs(_Fragment, { children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: selectedClientInfo?.fullName || '', onClick: () => {
                                                        setIsOpen(!isOpen);
                                                        if (!selectedClientInfo) {
                                                            handleSearchChange('');
                                                        }
                                                    }, placeholder: "\u041A\u043B\u0438\u0435\u043D\u0442\u044B", readOnly: true, className: `text-4 leading-4 p-3 w-full border rounded ${fieldState.error ? 'border-red-500' : 'border-gray-300'}` }), isOpen && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", children: [_jsx("input", { type: "text", autoFocus: true, value: searchClient, onChange: (e) => handleSearchChange(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "text-4 leading-4 p-3 w-full border-b" }), clientOptions.map((option) => (_jsx("div", { onClick: () => {
                                                                const client = clients?.find((c) => c.uuid === option.value) || null;
                                                                if (client) {
                                                                    handleClientSelection(client);
                                                                }
                                                            }, className: "p-3 cursor-pointer hover:bg-gray-100", children: option.label }, option.key)))] }))] }), fieldState.error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: fieldState.error.message }))] })) })), _jsxs("div", { className: "flex items-center justify-start gap-2 mt-4", children: [_jsx("label", { className: "block text-4 leading-4 font-medium", children: "\u0422\u0438\u043F \u043A\u043B\u0438\u0435\u043D\u0442\u0430:" }), _jsx("span", { className: "flex-1 bg-white border border-gray-300 p-3 rounded text-black text-4 leading-4", children: isNewClientMode
                                            ? 'Аноним'
                                            : selectedClientInfo
                                                ? roleTranslations[selectedClientInfo.role]
                                                : 'Клиент не выбран' })] }), selectedClientInfo?.role === UserRole.ClientCorp &&
                                selectedClientInfo?.companyProfile && (_jsxs("div", { className: "w-full flex flex-col items-start justify-start gap-2 mt-4", children: [_jsx("label", { className: "block text-4 leading-4 font-medium", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:" }), _jsx("span", { className: "w-full flex-1 bg-white border border-gray-300 p-3 rounded text-black text-4 leading-4", children: selectedClientInfo.companyProfile.companyName })] })), isNewClientMode && formState.errors.fullName && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: formState.errors.fullName.message }))] })] })] }));
};
export default ClientSelector;
