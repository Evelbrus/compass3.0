'use client';
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';
const renderField = (label, value) => (_jsxs("div", { className: "grid grid-cols-2 gap-2 w-full", children: [_jsxs("label", { className: "font-normal text-[14px] text-[#989898]", children: [label, ":"] }), _jsx("p", { className: "font-normal text-[14px] text-[#2A3037]", children: value || 'N/A' })] }));
const ClientDetailView = ({ userData }) => {
    const userFields = [
        { label: 'Email', value: userData.email },
        { label: 'ФИО', value: userData.fullName },
        { label: 'Телефон', value: userData.phone },
        { label: 'Пол', value: userData.gender },
        { label: 'Адрес', value: userData.address },
        { label: 'Доступность', value: userData.availability ? 'Available' : 'Unavailable' },
    ];
    const imageSrc = userData.profilePhotoPath
        ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
        : null;
    return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Client Details" }), _jsxs("section", { className: "flex flex-col sm:flex-row lg:flex-row md:flex-row gap-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 w-full", children: [imageSrc ? (_jsx(Image, { src: imageSrc, alt: "Client Profile Photo", width: 180, height: 180, className: "rounded-lg object-cover" })) : (_jsx("div", { className: "w-[180px] h-[180px] flex items-center justify-center bg-gray-50 rounded-lg", children: _jsx(LazyImage, { src: "/new-user.svg", alt: "Default Profile", className: "w-[140px] h-[140px]" }) })), _jsx("div", { className: "grid gap-2", children: userFields.map((field, index) => (_jsx(React.Fragment, { children: renderField(field.label, field.value) }, index))) })] })] }));
};
export default ClientDetailView;
