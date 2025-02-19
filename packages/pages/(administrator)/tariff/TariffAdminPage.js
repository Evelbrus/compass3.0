'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useRef, useCallback } from 'react';
import Tariff from '@widgets/tarrif/ui/Tariff';
import TariffTypes from '@widgets/tarrif/ui/TariffTypes';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { privateRoutes } from '@shared/utils/routing';
import { useRouter } from 'next/navigation';
import AdditionalServicesTable from '@widgets/additional-service/ui/AdditionalServicesTable';
import NoData from '@shared/components/errors/noData';
import SkeletonTable from '@shared/components/ui/table/ui/SkeletonTable';
const TariffAdminPage = () => {
    const [isDragging, setIsDragging] = useState(false);
    const router = useRouter();
    const scrollRef = useRef(null);
    const [tariffs, setTariffs] = useState([]);
    const [statusTariffs, setStatusTariffs] = useState('success');
    const [selectedTariff, setSelectedTariff] = useState();
    const [additionalServices, setAdditionalServices] = useState([]);
    const [statusadditionalServices, setStatusAdditionalServices] = useState('success');
    const handleSelectTariff = useCallback((tariff) => {
        setSelectedTariff(tariff);
    }, []);
    const fetchTariffs = async () => {
        try {
            setStatusTariffs('loading');
            const response = await fetch(`/api/tariffs`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to fetch tariffs');
            }
            setTariffs(data.data.tariffs);
            setSelectedTariff(data.data.tariffs[0]);
            setStatusTariffs('success');
        }
        catch (error) {
            console.error('Error fetching tariffs:', error);
            setStatusTariffs('error');
        }
    };
    const fetchAdditionalServices = async () => {
        try {
            setStatusAdditionalServices('loading');
            const response = await fetch('/api/additional-services');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setAdditionalServices(data.data.additionalServices);
            setStatusAdditionalServices('success');
        }
        catch (error) {
            console.error('Ошибка при получении услуг:', error);
            setStatusAdditionalServices('error');
        }
    };
    useEffect(() => {
        fetchTariffs();
        fetchAdditionalServices();
    }, []);
    const handleCreate = () => {
        router.push(privateRoutes.TARIFFCREATEMANAGEMENT);
    };
    const handleMouseDown = () => {
        setIsDragging(true);
    };
    const handleMouseMove = (event) => {
        if (isDragging && scrollRef.current) {
            scrollRef.current.scrollLeft -= event.movementX;
        }
    };
    const handleMouseUp = () => {
        setIsDragging(false);
    };
    const handleMouseLeave = () => {
        setIsDragging(false);
    };
    console.log(selectedTariff);
    const columns = [
        { header: 'Название', accessor: 'name', sortable: true },
        { header: 'Цена', accessor: 'price', sortable: true },
    ];
    return (_jsx(AnimatedComponent, { duration: 500, children: _jsxs("div", { className: "min-h-[calc(100vh-80px)] p-5 flex flex-col gap-4", children: [_jsxs("div", { className: "flex flex-row justify-between", children: [_jsx("h1", { className: "text-[40px] leading-6 content-center font-bold", children: "\u0422\u0430\u0440\u0438\u0444\u044B" }), _jsx(IButton, { onClick: handleCreate, className: "w-[200px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]\n                  text-white font-semibold transition duration-300 ease-in-out\n                  hover:bg-[color:var(--button-secondary-hover)]", textClassName: "text-4 leading-4 text-medium justify-center", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0442\u0430\u0440\u0438\u0444" })] }), statusTariffs === 'loading' ? (_jsx(SkeletonTable, { columns: columns, rows: 5 })) : selectedTariff ? (_jsx(Tariff, { data: selectedTariff })) : (_jsx(NoData, { message: "\u0422\u0430\u0440\u0438\u0444 \u043D\u0435 \u0432\u044B\u0431\u0440\u0430\u043D" })), statusTariffs === 'error' && (_jsx("p", { className: "text-red-500", children: "\u041E\u0448\u0438\u0431\u043A\u0430: Error fetching tariffs" })), _jsx("div", { className: "w-full overflow-x-auto custom-scroll cursor-grab no-select", ref: scrollRef, onMouseDown: handleMouseDown, onMouseMove: handleMouseMove, onMouseUp: handleMouseUp, onMouseLeave: handleMouseLeave, style: { cursor: isDragging ? 'grabbing' : 'grab' }, children: _jsx("div", { className: "flex flex-row gap-4 w-full p-3 max-w-[1200px] whitespace-nowrap", children: tariffs.map((tariff) => (_jsx(TariffTypes, { tariff: tariff, onSelectTariff: handleSelectTariff, selectedTariff: selectedTariff }, tariff.uuid))) }) }), _jsx(AdditionalServicesTable, { statusTariffs: statusTariffs, additionalServices: additionalServices, statusadditionalServices: statusadditionalServices, selectedTariff: selectedTariff })] }) }));
};
export default TariffAdminPage;
