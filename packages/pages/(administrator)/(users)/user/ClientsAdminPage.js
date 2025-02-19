'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import { UserRole } from '@prisma/client';
import ClientForm from '@pages/(administrator)/(users)/user/client/ClientForm';
import ClientCorpForm from '@pages/(administrator)/(users)/user/client-corp/ClientCorpForm';
import DriverForm from '@pages/(administrator)/(users)/user/driver/DriverForm';
import OperatorForm from '@pages/(administrator)/(users)/user/operator/OperatorForm';
import AdminForm from '@pages/(administrator)/(users)/user/admin/AdminForm';
import useClientsAdminForm from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { openModal, setUserFullName, setUserUuid } from '@shared/lib/effector';
const ClientsAdminPage = ({ mode, role, userData }) => {
    const router = useRouter();
    const { formMethods, currentStep, setCurrentStep, finalStep, previewImage, previewLogo, driverProfilePhotoPreview, passportPreview, licensePreview, handleNextStep, onSubmit, setPreviewImage, setPreviewLogo, setDriverProfilePhotoPreview, setPassportPreview, setLicensePreview, finalRole, } = useClientsAdminForm({ mode, role, userData });
    const formProps = { mode, control: formMethods.control, profilePhotoPath: previewImage };
    const renderForm = () => {
        switch (finalRole) {
            case UserRole.Client:
                return _jsx(ClientForm, { ...formProps, setPreview: setPreviewImage });
            case UserRole.ClientCorp:
                return (_jsx(ClientCorpForm, { ...formProps, logoImageSrc: previewLogo, currentStep: currentStep, setImagePreview: setPreviewImage, setLogoPreview: setPreviewLogo }));
            case UserRole.Driver:
                return (_jsx(DriverForm, { ...formProps, driverProfilePhotoSrc: driverProfilePhotoPreview, passportPhotoSrc: passportPreview, licenseSrc: licensePreview, currentStep: currentStep, setImagePreview: setPreviewImage, setDriverProfilePhotoPreview: setDriverProfilePhotoPreview, setPassportPreview: setPassportPreview, setLicensePreview: setLicensePreview }));
            case UserRole.Operator:
                return (_jsx(OperatorForm, { ...formProps, logoImageSrc: previewLogo, currentStep: currentStep, setImagePreview: setPreviewImage, setLogoPreview: setPreviewLogo }));
            case UserRole.Admin:
                return _jsx(AdminForm, { ...formProps, setPreview: setPreviewImage });
            default:
                return _jsx("div", { children: "Unknown user role" });
        }
    };
    const renderNavigationButtons = () => {
        return (_jsxs("div", { className: 'w-full flex justify-end gap-4', children: [_jsx("button", { type: "button", onClick: () => {
                        if (currentStep > 1) {
                            setCurrentStep((prev) => prev - 1);
                        }
                        else {
                            router.back();
                        }
                    }, className: "w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", children: "\u041D\u0430\u0437\u0430\u0434" }), currentStep < finalStep ? (_jsx("button", { type: "button", onClick: async (e) => {
                        e.preventDefault();
                        await handleNextStep();
                    }, className: "w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", children: "\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C" })) : (_jsx("button", { type: "submit", className: "w-[205px] p-3 bg-[color:var(--button-secondary)]\n            text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]\n            transition", children: mode === 'create' ? 'Создать' : 'Сохранить' }))] }));
    };
    const onFormSubmit = currentStep === finalStep
        ? formMethods.handleSubmit(onSubmit)
        : (e) => e.preventDefault();
    const formTitle = mode === 'create' ? `Создание (${finalRole})` : `Редактирование (${finalRole})`;
    return (_jsx(FormProvider, { ...formMethods, children: _jsxs("form", { onSubmit: onFormSubmit, className: 'flex flex-col gap-4', children: [_jsxs("div", { className: 'flex flex-row justify-between items-center', children: [_jsx("h1", { className: "text-2xl font-extrabold leading-4", children: formTitle }), mode === 'edit' && userData?.uuid && (_jsx("button", { type: "button", onClick: () => {
                                setUserUuid(userData.uuid);
                                setUserFullName(userData.fullName);
                                openModal('changePasswordModal');
                            }, className: "p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition", children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C" }))] }), renderForm(), renderNavigationButtons()] }) }));
};
export default ClientsAdminPage;
