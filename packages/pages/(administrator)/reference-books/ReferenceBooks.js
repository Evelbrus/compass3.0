'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter, useSearchParams } from 'next/navigation';
import Points from '@pages/(administrator)/reference-books/point/Points';
import AdditionalServices from '@pages/(administrator)/reference-books/additional_service/AdditionalServices';
const ReferenceBooks = ({ initialTab }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(initialTab);
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'points' || tab === 'additionalServices') {
            setActiveTab(tab);
        }
    }, [searchParams]);
    const handleNavigateToAdditionalServices = () => {
        router.push('/reference-book/additional-services');
    };
    const handleNavigateToPoints = () => {
        router.push('/reference-book/points');
    };
    return (_jsxs("div", { children: [_jsxs("div", { className: "flex flex-row gap-6 p-5", children: [_jsx(IButton, { onClick: handleNavigateToAdditionalServices, children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), _jsx(IButton, { onClick: handleNavigateToPoints, children: "\u041F\u0443\u043D\u043A\u0442\u044B \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F" })] }), activeTab === 'additionalServices' && _jsx(AdditionalServices, {}), activeTab === 'points' && _jsx(Points, {})] }));
};
export default ReferenceBooks;
