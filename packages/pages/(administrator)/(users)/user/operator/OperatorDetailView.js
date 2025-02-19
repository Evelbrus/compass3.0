'use client';
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';
import { DetailItem } from '@pages/(administrator)/vehicles/VehiclesDetail';
const renderField = (label, value) => (_jsxs("div", { className: "grid grid-cols-2 gap-4 w-full", children: [_jsxs("label", { className: "font-normal text-[14px] leading-[13.93px] text-[#989898] mb-[14px]", children: [label, ":"] }), _jsx("p", { className: "font-normal text-[14px] leading-[13.93px] text-[#2A3037]", children: value || 'N/A' })] }));
const OperatorDetailView = ({ userData }) => {
    const userFields = [
        { label: 'Email', value: userData.email },
        { label: 'Availability', value: userData.availability ? 'Available' : 'Unavailable' },
        { label: 'Full Name', value: userData.fullName },
        { label: 'Phone', value: userData.phone },
        { label: 'Gender', value: userData.gender },
        { label: 'Address', value: userData.address },
        //{ label: 'Profile Photo Path', value: userData.profilePhotoPath },
    ];
    const companyFields = userData.companyProfile
        ? [
            { label: 'Company Name', value: userData.companyProfile.companyName },
            { label: 'Company Email', value: userData.companyProfile.email },
            { label: 'Company Phone', value: userData.companyProfile.phone },
            { label: 'Company Address', value: userData.companyProfile.address },
            { label: 'Website', value: userData.companyProfile.website },
            { label: 'Company PIN', value: userData.companyProfile.companyPin },
        ]
        : [];
    return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Operator Details" }), _jsxs("section", { className: "mx-auto flex gap-[12px] p-6 bg-white shadow-md rounded-lg border border-gray-200", children: [userData.profilePhotoPath ? (_jsx(Image, { src: userData.profilePhotoPath, alt: "Profile Photo", width: 180, height: 180, className: "rounded-full object-cover" })) : (_jsx("div", { className: "max-w-[280px] h-[200px] flex items-center justify-center bg-gray-50 p-[30px] rounded-[8px]", children: _jsx(LazyImage, { src: "/new-user.svg", alt: "logotype", className: "w-[330px] h-[140px]" }) })), _jsx("div", { className: "mt-[20px] w-full", children: userFields.map((field, index) => (_jsx(React.Fragment, { children: renderField(field.label, field.value) }, index))) }), _jsx("div", { className: "w-full h-[240px]  bg-gray-50 p-[30px] flex items-center justify-center", children: _jsx("h1", { children: "Logo" }) })] }), _jsxs("div", { className: "rounded-lg mt-4", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-700 mb-6", children: "Operator Profile" }), _jsx("div", { className: "p-4 bg-white grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 gap-2", children: companyFields.map((field, index) => (_jsx(DetailItem, { label: field.label, value: field.value }, index))) })] })] }));
};
export default OperatorDetailView;
