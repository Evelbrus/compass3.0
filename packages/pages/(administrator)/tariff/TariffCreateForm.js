'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { steps } from '@pages/(administrator)/tariff/constants/_tariff';
import TariffCreateStep1 from '@pages/(administrator)/tariff/step-create/TariffCreateStep1';
import TariffCreateStep3 from '@pages/(administrator)/tariff/step-create/TariffCreateStep3';
import TariffCreateStep2 from '@pages/(administrator)/tariff/step-create/TariffCreateStep2';
const TariffCreateForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        vehicleType: undefined,
        description: '',
        price: 0,
        additionalPointPrice: 0,
        freeWaitTimeBishkek: 0,
        pricePerMinuteAfterBishkek: 0,
        freeWaitTimeAirport: 0,
        pricePerMinuteAfterAirport: 0,
        serviceLevel: undefined,
        tariffAdditionalServices: [],
    });
    const [additionalServices, setAdditionalServices] = useState([]);
    const [selectedAdditionalServices, setSelectedAdditionalServices] = useState([]);
    const [step, setStep] = useState(1);
    const router = useRouter();
    useEffect(() => {
        //Fetch additional services
        fetch('/api/additional-services?page=1&per_page=100&sort_by=name&sort_order=asc')
            .then((response) => response.json())
            .then((data) => {
            const services = data.data.additionalServices;
            setAdditionalServices(services);
            console.log('services:', services);
        })
            .catch((error) => console.error('Error fetching additional services:', error));
    }, []);
    useEffect(() => {
        setFormData((prevData) => ({
            ...prevData,
            tariffAdditionalServices: selectedAdditionalServices,
        }));
    }, [selectedAdditionalServices]);
    const handleInputChange = (event) => {
        const { id, value, type } = event.target;
        const checked = type === 'checkbox' ? event.target.checked : undefined;
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === 'number' ? (value ? Number(value) : 0) : type === 'checkbox' ? checked : value,
        }));
    };
    const handleBack = () => {
        if (step === 1) {
            router.push('/tariff-management');
        }
        else {
            setStep(step - 1);
        }
    };
    const handleNext = () => {
        setStep(step + 1);
    };
    const handleAddAdditionalService = (updatedService) => {
        setFormData((prev) => {
            const existingServiceIndex = prev.tariffAdditionalServices.findIndex((service) => service.serviceUuid === updatedService.serviceUuid);
            if (existingServiceIndex !== -1) {
                const updatedServices = [...prev.tariffAdditionalServices];
                updatedServices[existingServiceIndex] = updatedService;
                return {
                    ...prev,
                    tariffAdditionalServices: updatedServices,
                };
            }
            else {
                return {
                    ...prev,
                    tariffAdditionalServices: [...prev.tariffAdditionalServices, updatedService],
                };
            }
        });
    };
    const handleRemoveAdditionalService = (serviceUuid) => {
        setFormData((prev) => ({
            ...prev,
            tariffAdditionalServices: prev.tariffAdditionalServices.filter((service) => service.serviceUuid !== serviceUuid),
        }));
    };
    const handleSubmit = async (event) => {
        event.preventDefault();
        const submissionData = {
            ...formData,
            tariffAdditionalServices: formData.tariffAdditionalServices,
        };
        console.log('Form data:', submissionData);
        try {
            const response = await fetch('/api/tariffs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const result = await response.json();
            if (result && result.uuid) {
                showToast.success('Tariff created successfully');
                router.push(`/tariff-management/`);
            }
            else {
                showToast.error('Failed to redirect to tariff details page');
            }
        }
        catch (error) {
            showToast.error(`Error creating tariff: ${error.message}`);
        }
    };
    return (_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Create Tariff" }), _jsxs("section", { className: "flex flex-col justify-center bg-white rounded-md", children: [_jsxs("form", { onSubmit: handleSubmit, id: "tariff-create-form", className: "grid grid-cols-1 gap-x-8 gap-y-4 p-6", children: [_jsx("div", { className: "flex justify-start gap-2 mb-4", children: steps.map((label, index) => (_jsx("div", { className: `p-2 border-2 ${step === index + 1
                                        ? 'border-t-0 border-x-0 border-b-[#2A3037]'
                                        : 'border-t-0 border-x-0 border-b-white'}`, children: label }, index))) }), step === 1 && (_jsx(TariffCreateStep1, { handleInputChange: handleInputChange, formData: formData, setFormData: setFormData })), step === 2 && (_jsx(TariffCreateStep3, { formData: formData, additionalServices: additionalServices, handleAddAdditionalService: handleAddAdditionalService, handleRemoveAdditionalService: handleRemoveAdditionalService })), step === 3 && (_jsx(TariffCreateStep2, { handleInputChange: handleInputChange, formData: formData, setFormData: setFormData }))] }), _jsxs("div", { className: 'w-full flex justify-end gap-4 p-6', children: [_jsx(IButton, { type: "button", className: "w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", onClick: handleBack, children: "\u041D\u0430\u0437\u0430\u0434" }), step < 3 && (_jsx(IButton, { type: "button", className: "w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", onClick: handleNext, children: "\u0414\u0430\u043B\u0435\u0435" })), step === 3 && (_jsx(IButton, { type: "submit", form: "tariff-create-form", className: "w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0442\u0430\u0440\u0438\u0444" }))] })] })] }));
};
export default TariffCreateForm;
