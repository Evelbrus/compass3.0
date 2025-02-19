'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import TariffEditStep1 from '@pages/(administrator)/tariff/step-edit/TariffEditStep1';
import TariffEditStep3 from '@pages/(administrator)/tariff/step-edit/TariffEditStep3';
import TariffEditStep2 from '@pages/(administrator)/tariff/step-edit/TariffEditStep2';
import { steps } from '@pages/(administrator)/tariff/constants/_tariff';
const TariffEdit = ({ data }) => {
    const methods = useForm({
        defaultValues: {
            name: data.name ?? '',
            description: data.description ?? '',
            price: data.price ?? 0,
            additionalPointPrice: data.additionalPointPrice ?? 0,
            vehicleType: data.vehicleType ?? 'DEFAULT_VEHICLE_TYPE',
            serviceLevel: data.serviceLevel ?? 'DEFAULT_SERVICE_LEVEL',
            freeWaitTimeAirport: data.freeWaitTimeAirport ?? 0,
            freeWaitTimeBishkek: data.freeWaitTimeBishkek ?? 0,
            pricePerMinuteAfterAirport: data.pricePerMinuteAfterAirport ?? 0,
            pricePerMinuteAfterBishkek: data.pricePerMinuteAfterBishkek ?? 0,
            tariffIds: data.tariffAdditionalServices?.map((service) => service.service.uuid) ?? [],
            tariffAdditionalServices: data.tariffAdditionalServices?.map((service) => ({
                serviceUuid: service.service.uuid ?? '',
                price: service.price ?? 0,
                isAvailable: service.isAvailable ?? false,
            })) ?? [],
        },
    });
    const [additionalServices, setAdditionalServices] = useState([]);
    const [step, setStep] = useState(1);
    const { handleSubmit } = methods;
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
    const onSubmit = async (formData) => {
        try {
            const response = await fetch(`/api/tariffs/${data.uuid}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (!response.ok) {
                showToast.error('Error updating tariff');
                return;
            }
            const res = await response.json();
            if (res && res.uuid) {
                showToast.success('Tariff updated successfully');
                router.push(`/tariff-management/`);
            }
            else {
                showToast.error('Failed to redirect to tariff details page');
            }
        }
        catch (error) {
            showToast.error(`Error updating tariff: ${error.message}`);
        }
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
    return (_jsx(FormProvider, { ...methods, children: _jsxs("section", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-6", children: "Edit Tariff" }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), id: "tariff-edit-form", className: "grid grid-cols-1 gap-4 p-6 bg-white shadow-md rounded-lg border border-gray-200", children: [_jsx("div", { className: "flex justify-start gap-2 mb-4", children: steps.map((label, index) => (_jsx("div", { className: `p-2 border-2 ${step === index + 1
                                    ? 'border-t-0 border-x-0 border-b-[#2A3037]'
                                    : 'border-t-0 border-x-0 border-b-white'}`, children: label }, index))) }), step === 1 && _jsx(TariffEditStep1, {}), step === 2 && _jsx(TariffEditStep3, { data: data, additionalServices: additionalServices }), step === 3 && _jsx(TariffEditStep2, {})] }), _jsxs("div", { className: 'w-full flex justify-end gap-4 p-6', children: [_jsx(IButton, { type: "button", className: "w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", onClick: handleBack, children: "\u041D\u0430\u0437\u0430\u0434" }), step < 3 && (_jsx(IButton, { type: "button", className: "w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", onClick: handleNext, children: "\u0414\u0430\u043B\u0435\u0435" })), step === 3 && (_jsx(IButton, { type: "submit", form: "tariff-edit-form", className: "w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F" }))] })] }) }));
};
export default TariffEdit;
