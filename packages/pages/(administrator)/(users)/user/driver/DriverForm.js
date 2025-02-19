import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DriverFormStepOne from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepOne';
import DriverFormStepTwo from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepTwo';
import DriverFormStepThree from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepThree';
import DriverFormStepFour from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFour';
import DriverFormStepFive from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFive';
import { cn } from '@shared/lib';
const steps = [
    'Основная информация',
    'Паспортные данные',
    'Стаж вождения',
    'опыт работы',
    'Банковские реквизиты',
];
const DriverForm = ({ mode, profilePhotoPath, driverProfilePhotoSrc, passportPhotoSrc, licenseSrc, currentStep, setImagePreview, setDriverProfilePhotoPreview, setPassportPreview, setLicensePreview, }) => {
    return (_jsxs("div", { className: "p-5 bg-white border rounded-xl", children: [_jsx("div", { className: "flex justify-start gap-x-6 border-b overflow-auto", children: steps.map((step, index) => (_jsx("div", { className: cn('text-4 font-medium p-2 text-center transition-all duration-300', currentStep === index + 1
                        ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                        : 'text-gray-500'), children: step }, index))) }), _jsxs("div", { children: [currentStep === 1 && (_jsx(DriverFormStepOne, { profilePhotoPath: profilePhotoPath, setImagePreview: setImagePreview, mode: mode })), currentStep === 2 && (_jsx(DriverFormStepTwo, { passportPhotoSrc: passportPhotoSrc, driverProfilePhotoSrc: driverProfilePhotoSrc, setPassportPreview: setPassportPreview, setDriverProfilePhotoPreview: setDriverProfilePhotoPreview })), currentStep === 3 && (_jsx(DriverFormStepThree, { licenseSrc: licenseSrc, setLicensePreview: setLicensePreview })), currentStep === 4 && _jsx(DriverFormStepFour, { mode: mode }), currentStep === 5 && _jsx(DriverFormStepFive, {})] })] }));
};
export default DriverForm;
