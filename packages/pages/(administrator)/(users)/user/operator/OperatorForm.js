import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import OperatorFormStepOne from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepOne';
import OperatorFormStepTwo from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepTwo';
import { cn } from '@shared/lib';
const steps = ['Основная информация', 'Логотип'];
const OperatorForm = ({ mode, profilePhotoPath, logoImageSrc, currentStep, setImagePreview, setLogoPreview, }) => {
    return (_jsxs("div", { className: "p-5 bg-white border rounded-xl", children: [_jsx("div", { className: "flex justify-start gap-x-6 border-b overflow-auto", children: steps.map((step, index) => (_jsx("div", { className: cn('text-4 font-medium p-2 text-center transition-all duration-300', currentStep === index + 1
                        ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                        : 'text-gray-500'), children: step }, index))) }), _jsxs("div", { children: [currentStep === 1 && (_jsx(OperatorFormStepOne, { profilePhotoPath: profilePhotoPath, mode: mode, setPreview: setImagePreview })), currentStep === 2 && (_jsx(OperatorFormStepTwo, { logoImageSrc: logoImageSrc, setLogoPreview: setLogoPreview }))] })] }));
};
export default OperatorForm;
