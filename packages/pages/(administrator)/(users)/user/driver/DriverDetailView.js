'use client';
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { DetailItem } from '@pages/(administrator)/vehicles/VehiclesDetail';
import { useRouter } from 'next/navigation';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
const renderField = (label, value) => (_jsxs("div", { className: "grid grid-cols-2 gap-2 w-full", children: [_jsxs("label", { className: "font-normal text-[14px] leading-[13.93px] text-[#989898]", children: [label, ":"] }), _jsx("p", { className: "font-normal text-[14px] leading-[13.93px] text-[#2A3037]", children: value !== null && value !== undefined ? String(value) : 'N/A' })] }));
const DriverDetailView = ({ userData }) => {
    const router = useRouter();
    console.log('userData.uuid', userData.uuid);
    const userFields = [
        { label: 'Email', value: userData.email },
        { label: 'ФИО', value: userData.fullName },
        { label: 'Телефон', value: userData.phone },
        { label: 'Пол', value: userData.gender },
        { label: 'Адрес', value: userData.address },
        { label: 'Доступность', value: userData.availability ? 'Available' : 'Unavailable' },
        { label: 'Смена', value: userData.driverProfile?.changingDriver },
    ];
    const companyFields = userData.driverProfile
        ? [
            //Убрано поле "Status", так как оно отсутствует в типе DriverProfile
            { label: 'Citizenship', value: userData.driverProfile.citizenship },
            { label: 'Identity Document', value: userData.driverProfile.identityDocument },
            { label: 'Passport ID', value: userData.driverProfile.passportId },
            {
                label: 'Passport Issue Date',
                value: userData.driverProfile.passportIssueDate
                    ? new Date(userData.driverProfile.passportIssueDate).toLocaleDateString()
                    : '',
            },
            { label: 'Passport Issued By', value: userData.driverProfile.passportIssued },
            {
                label: 'Birth Date',
                value: userData.driverProfile.birthDate
                    ? new Date(userData.driverProfile.birthDate).toLocaleDateString()
                    : '',
            },
            { label: 'Birth Place', value: userData.driverProfile.birthPlace },
            { label: 'Actual Address', value: userData.driverProfile.actualAddress },
            { label: 'Permanent Address', value: userData.driverProfile.permanentAddress },
            { label: 'Changing Driver', value: userData.driverProfile.changingDriver },
            { label: 'Years of Driving', value: userData.driverProfile.yearsOfDriving },
            //{ label: 'Passport Photo Path', value: userData.driverProfile.passportPhotoPath },
            //{ label: 'License Photo Path', value: userData.driverProfile.licensePhotoPath },
            { label: 'Bank Name', value: userData.driverProfile.bankName },
            { label: 'Bank BIC', value: userData.driverProfile.bankBic },
            { label: 'Bank Account Number', value: userData.driverProfile.bankAccountNumber },
            { label: 'Card Number', value: userData.driverProfile.cardNumber },
            //{ label: 'Profile Photo Path', value: userData.driverProfile.profilePhotoPath },
        ]
        : [];
    //URL для фото пользователя (основное фото)
    const profilePhotoUrl = userData.profilePhotoPath
        ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
        : null;
    console.log('profilePhotoUrl', profilePhotoUrl);
    //URL для фото паспорта
    const passportPhotoUrl = userData.driverProfile?.passportPhotoPath
        ? `/api/images/${userData.driverProfile.passportPhotoPath.split('/').pop()}?type=drivers/passport`
        : null;
    //URL для фото лицензии
    const licensePhotoUrl = userData.driverProfile?.licensePhotoPath
        ? `/api/images/${userData.driverProfile.licensePhotoPath.split('/').pop()}?type=drivers/license`
        : null;
    //URL для дополнительного фото из профиля водителя
    const driverProfilePhotoUrl = userData.driverProfile?.profilePhotoPath
        ? `/api/images/${userData.driverProfile.profilePhotoPath.split('/').pop()}?type=drivers/profile`
        : null;
    const handleEdit = () => {
        router.push(`/user/edit/${userData.uuid}`);
    };
    return (_jsxs(_Fragment, { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Driver Details" }), _jsxs("section", { className: "flex bg-white shadow-md rounded-lg border border-gray-200 p-6", children: [_jsxs("div", { className: "nx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 w-full", children: [_jsx("div", { className: "flex flex-col", children: _jsxs("div", { className: "mt-[20px] w-full flex gap-[12px]", children: [profilePhotoUrl ? (_jsx(LazyImage, { src: profilePhotoUrl, alt: "Profile Photo", className: "w-[180px] h-[180px] rounded-lg object-cover" })) : (_jsx("div", { className: "max-w-[280px] h-[200px] flex items-center justify-center bg-gray-50 p-[30px] rounded-[8px]", children: _jsx(LazyImage, { src: "/new-user.svg", alt: "logotype", className: "w-[330px] h-[140px]" }) })), _jsx("div", { className: "grid gap-2", children: userFields.map((field, index) => (_jsx(React.Fragment, { children: renderField(field.label, field.value) }, index))) })] }) }), _jsxs("div", { className: "grid grid-cols-2 gap-1 w-full", children: [_jsx("div", { className: "w-full h-[145px] bg-gray-50 flex items-center justify-center rounded-lg", children: passportPhotoUrl ? (_jsx(ImageUploadWithCrop, { initialSrc: passportPhotoUrl, label: "\u0424\u043E\u0442\u043E \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430", containerWidth: "w-full", containerHeight: 145, mode: "gallery" })) : (_jsxs("div", { className: "flex items-center gap-[18px] p-[30px]", children: [_jsx(LazyImage, { src: "/doc_icon3.png", alt: "doc icon", className: "w-[76px] h-[76px]" }), _jsx(LazyImage, { src: "/doc_icon2.png", alt: "doc icon", className: "w-[160px] h-[56px]" })] })) }), _jsx("div", { className: "w-full h-[145px] bg-gray-50 flex items-center justify-center", children: licensePhotoUrl ? (_jsx(ImageUploadWithCrop, { initialSrc: licensePhotoUrl, label: "License Photo", containerWidth: "w-full", containerHeight: 145, mode: "gallery" })) : (_jsxs("div", { className: "flex items-center gap-[18px] p-[30px]", children: [_jsx(LazyImage, { src: "/doc_icon1.png", alt: "doc icon", className: "w-[50px] h-[40px]" }), _jsx(LazyImage, { src: "/doc_icon2.png", alt: "doc icon", className: "w-[170px] h-[66px]" })] })) }), _jsx("div", { className: "w-full h-[145px] bg-gray-50 flex items-center justify-center", children: driverProfilePhotoUrl ? (_jsx(ImageUploadWithCrop, { initialSrc: driverProfilePhotoUrl, label: "Driver Profile Additional Photo", containerWidth: "w-full", containerHeight: 145, mode: "gallery" })) : (_jsxs("div", { className: "flex items-center gap-[18px] p-[30px]", children: [_jsx(LazyImage, { src: "/doc_icon1.png", alt: "doc icon", className: "w-[50px] h-[40px]" }), _jsx(LazyImage, { src: "/doc_icon2.png", alt: "doc icon", className: "w-[170px] h-[66px]" })] })) })] })] }), _jsx("div", { onClick: handleEdit, className: "cursor-pointer ml-[9px]", children: _jsx(LazyImage, { src: "/edit.png", alt: "driver-profile-edit_icon", className: "w-[24px] h-[24px]" }) })] }), _jsx("h2", { className: "text-2xl font-bold text-gray-800 my-6", children: "Driver Profile" }), _jsx("div", { className: "rounded-lg p-6 bg-white shadow-md border border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-4", children: companyFields.map((field, index) => (_jsx(DetailItem, { label: field.label, value: field.value }, index))) })] }));
};
export default DriverDetailView;
