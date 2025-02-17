import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { Decimal } from 'decimal.js';
//Хуки
import useTariffs from '@shared/components/modal/create-client-corp-order/hooks/tariff/useTariffs';
import usePointSelector from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelector';
import useCreateClientCorpOrderLogic from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import useAdditionalServices from '@shared/components/modal/create-client-corp-order/hooks/additional-service/useAdditionalServices';
import useWaitTime from '@shared/components/modal/create-client-corp-order/hooks/wait/useWaitTime';
import useTotalPrice from '@shared/components/modal/create-client-corp-order/hooks/price/useTotalPrice';
import useSubmitOrder from '@shared/components/modal/create-client-corp-order/hooks/useSubmitOrder';
import useClientNotifications from '@shared/components/modal/create-client-corp-order/hooks/notifications/useClientNotifications';
//Компоненты
import TariffCheckbox from '@shared/components/modal/create-client-corp-order/ui/TariffCheckbox';
import PointSelector from '@shared/components/modal/create-client-corp-order/inputs/PointSelector';
import AdditionalPoints from '@shared/components/modal/create-client-corp-order/ui/AdditionalPoints';
import AdditionalServicesList from '@shared/components/modal/create-client-corp-order/ui/AdditionalServicesList';
import FlightDetails from '@shared/components/modal/create-client-corp-order/ui/FlightDetails';
import usePointSelectionHandlers from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelectionHandlers';
import WaitTimeSelector from '@shared/components/modal/create-client-corp-order/ui/WaitTimeSelector';
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
const CreateClientCorpOrder = ({ onClose }) => {
    const router = useRouter();
    const [ServiceLevel, setServiceLevel] = useState();
    const [VehicleType, setVehicleType] = useState();
    const tariffAndServices = useTariffs({
        vehicleType: VehicleType,
    });
    const tariffs = tariffAndServices.tariffs || [];
    const { selectedServiceLevel, selectedVehicleType, selectedTariff, handleServiceLevelChange, handleVehicleTypeChange, formMethods, } = useCreateClientCorpOrderLogic(tariffs, ServiceLevel, VehicleType);
    //------------------ Селектор для адреса подачи (departure) ------------------
    const { isOpen: isFromOpen, searchValue: fromSearchValue, search: fromSearch, filteredPoints: fromFilteredPoints, loading: fromLoading, onOpenSelect: onFromOpenSelect, onSearchValueChange: onFromSearchValueChange, handleSearchChange: handleFromSearchChange, onSelectPoint: onFromSelectPoint, selectorRef: fromSelectorRef, observerRef: fromObserverRef, selectedPoint: departurePoint, } = usePointSelector({ mode: 'single' });
    //------------------ Селектор для адреса прибытия (arrival) ------------------
    const { isOpen: isToOpen, searchValue: toSearchValue, search: toSearch, filteredPoints: toFilteredPoints, loading: toLoading, onOpenSelect: onToOpenSelect, onSearchValueChange: onToSearchValueChange, handleSearchChange: handleToSearchChange, onSelectPoint: onToSelectPoint, selectorRef: toSelectorRef, observerRef: toObserverRef, selectedPoint: arrivalPoint, } = usePointSelector({ mode: 'single' });
    //-------------- Селектор для дополнительных остановок (multiple) --------------
    const { isOpen: isAdditionalOpen, searchValue: additionalSearchValue, search: additionalSearch, filteredPoints: additionalFilteredPoints, loading: additionalLoading, onOpenSelect: onAdditionalOpenSelect, onSearchValueChange: onAdditionalSearchValueChange, handleSearchChange: onAdditionalHandleSearchChange, onSelectPoint: onAdditionalSelectPoint, selectorRef: additionalSelectorRef, observerRef: additionalObserverRef, selectedPoints: additionalPoints, onRemovePoint, onChangeOrder, totalAdditionalPrice, } = usePointSelector({
        mode: 'multiple',
        initialSelectedPoints: Array(5).fill(null),
        additionalPointPrice: selectedTariff?.additionalPointPrice,
    });
    const { availableServices, handleServiceSelection, selectedServices, totalAdditionalServicesPrice, } = useAdditionalServices(selectedTariff);
    const { handleDepartureSelectPoint, handleArrivalSelectPoint, handleAdditionalSelectPoint } = usePointSelectionHandlers({
        departurePoint: departurePoint
            ? { ...departurePoint, basePrice: new Decimal(departurePoint.basePrice) }
            : undefined,
        arrivalPoint: arrivalPoint
            ? { ...arrivalPoint, basePrice: new Decimal(arrivalPoint.basePrice) }
            : undefined,
        additionalPoints: additionalPoints
            ? additionalPoints.map((point) => point ? { ...point, basePrice: new Decimal(point.basePrice) } : null)
            : undefined,
        onFromSelectPoint: (point) => onFromSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) }),
        onToSelectPoint: (point) => onToSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) }),
        onAdditionalSelectPoint: (point, index) => onAdditionalSelectPoint({ ...point, basePrice: new Decimal(point.basePrice) }, index),
    });
    const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } = useWaitTime({ selectedTariff, departurePoint });
    const totalPrice = useTotalPrice({
        tariffPrice: selectedTariff?.price,
        additionalServicesPrice: totalAdditionalServicesPrice,
        additionalPointsPrice: totalAdditionalPrice,
        arrivalPrice: arrivalPoint ? arrivalPoint.basePrice : null,
        waitTimeCost: additionalWaitTimeCost,
    });
    const { handleOrderSuccess, handleOrderError } = useClientNotifications({
        departurePoint,
        arrivalPoint,
    });
    const { submitOrder, isSubmitting, error } = useSubmitOrder();
    const onSubmit = async (formData) => {
        try {
            //Передаём все необходимые данные в submitOrder
            await submitOrder({
                selectedTariff,
                departurePoint: departurePoint?.uuid ?? '',
                arrivalPoint: arrivalPoint?.uuid ?? '',
                additionalPoints: additionalPoints
                    ?.map((point) => point?.uuid)
                    .filter((uuid) => Boolean(uuid)),
                selectedServices,
                totalPrice,
                departureTime: formData.departureTime,
                flightNumber: formData.flightNumber || '',
                description: formData.description || '',
                waitingTimeMinutes: waitTime,
            });
            showToast.success('Заказ создан успешно!');
            handleOrderSuccess();
            router.push('/orders');
            onClose();
        }
        catch (err) {
            handleOrderError(err);
        }
    };
    if (tariffAndServices.isInitialMount) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-3xl", children: _jsx("div", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430..." }) }) }));
    }
    if (tariffAndServices.error) {
        return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-3xl", children: [_jsxs("div", { children: ["\u041E\u0448\u0438\u0431\u043A\u0430: ", tariffAndServices.error] }), _jsx(IButton, { onClick: onClose, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
    }
    return (_jsx(FormProvider, { ...formMethods, children: _jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "relative flex flex-col bg-white rounded-3xl p-8 w-full h-full max-w-3xl gap-4 overflow-y-auto", children: [_jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsxs("form", { className: "flex flex-col gap-4", onSubmit: formMethods.handleSubmit(onSubmit), children: [_jsx("h2", { className: "text-3xl font-semibold", children: "\u0421\u043E\u0437\u0434\u0430\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsx("div", { className: "flex border" }), _jsxs("h2", { className: "text-2xl font-semibold", children: ["1. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u0430\u0440\u0438\u0444", _jsx("br", {}), "(\u0442\u0438\u043F \u0430\u0432\u0442\u043E \u0438 \u0443\u0440\u043E\u0432\u0435\u043D\u044C \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u044F)"] }), _jsx(TariffCheckbox, { tariffs: tariffs, selectedServiceLevel: selectedServiceLevel, selectedVehicleType: selectedVehicleType, selectedTariffUuid: selectedTariff?.uuid || null, handleServiceLevelChange: handleServiceLevelChange, handleVehicleTypeChange: handleVehicleTypeChange, ...formMethods }), _jsx("div", { className: "w-[50%] flex border" }), _jsx("h2", { className: "text-2xl font-semibold", children: "2. \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043F\u043E\u0434\u0430\u0447\u0438" }), _jsxs("div", { className: "flex flex-row gap-4", children: [_jsxs("div", { className: "w-full flex flex-col gap-4 p-4 border-2 rounded-md", children: [_jsx(PointSelector, { control: formMethods.control, name: "departurePoint", label: "\u0410\u0434\u0440\u0435\u0441 \u043F\u043E\u0434\u0430\u0447\u0438", isOpen: isFromOpen, searchValue: fromSearchValue, onOpenSelect: onFromOpenSelect, onSearchValueChange: onFromSearchValueChange, search: fromSearch, handleSearchChange: handleFromSearchChange, filteredPoints: fromFilteredPoints.map((point) => ({
                                                    ...point,
                                                    basePrice: new Decimal(point.basePrice),
                                                })), loading: fromLoading, onSelectPoint: handleDepartureSelectPoint, selectorRef: fromSelectorRef, observerRef: fromObserverRef, selectedPoint: departurePoint
                                                    ? { ...departurePoint, basePrice: new Decimal(departurePoint.basePrice) }
                                                    : null }), _jsx(PointSelector, { control: formMethods.control, name: "arrivalPoint", label: "\u0410\u0434\u0440\u0435\u0441 \u043F\u0440\u0438\u0431\u044B\u0442\u0438\u044F", isOpen: isToOpen, searchValue: toSearchValue, onOpenSelect: onToOpenSelect, onSearchValueChange: onToSearchValueChange, search: toSearch, handleSearchChange: handleToSearchChange, filteredPoints: toFilteredPoints.map((point) => ({
                                                    ...point,
                                                    basePrice: new Decimal(point.basePrice),
                                                })), loading: toLoading, onSelectPoint: handleArrivalSelectPoint, selectorRef: toSelectorRef, observerRef: toObserverRef, selectedPoint: arrivalPoint
                                                    ? { ...arrivalPoint, basePrice: new Decimal(arrivalPoint.basePrice) }
                                                    : null, arrivalPointPrice: arrivalPoint?.basePrice || undefined })] }), _jsx(AdditionalPoints, { label: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438", isOpen: isAdditionalOpen, searchValue: additionalSearchValue, onOpenSelect: onAdditionalOpenSelect, onSearchValueChange: onAdditionalSearchValueChange, search: additionalSearch, filteredPoints: additionalFilteredPoints.map((point) => ({
                                            ...point,
                                            basePrice: new Decimal(point.basePrice),
                                        })), loading: additionalLoading, onSelectPoint: (point, index) => handleAdditionalSelectPoint(point, index ?? 0), selectorRef: additionalSelectorRef, observerRef: additionalObserverRef, selectedPoints: additionalPoints
                                            ? additionalPoints.map((point) => point ? { ...point, basePrice: new Decimal(point.basePrice) } : null)
                                            : [], onRemovePoint: onRemovePoint || (() => { }), onChangeOrder: onChangeOrder, handleSearchChange: onAdditionalHandleSearchChange, onMaxLimitReached: () => alert('Достигнут лимит дополнительных остановок'), totalAdditionalPrice: totalAdditionalPrice })] }), _jsx("div", { className: "flex border" }), _jsxs("h2", { className: "text-2xl font-semibold", children: ["3. \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435", _jsx("br", {}), "\u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438"] }), _jsxs("div", { className: "flex flex-row gap-4", children: [_jsxs("div", { className: "w-full flex flex-col gap-2", children: [_jsx(FlightDetails, { ...formMethods }), _jsx(WaitTimeSelector, { waitTime: waitTime, additionalWaitTimeCost: additionalWaitTimeCost, adjustWaitTime: adjustWaitTime, minWaitTime: minWaitTime, maxWaitTime: maxWaitTime, departurePoint: departurePoint, freeWaitTime: selectedTariff?.freeWaitTimeAirport ?? 0 })] }), _jsx(AdditionalServicesList, { label: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043E\u043F\u0446\u0438\u0438", availableServices: availableServices, handleServiceSelection: handleServiceSelection, selectedServices: selectedServices, totalAdditionalServicesPrice: totalAdditionalServicesPrice })] }), _jsx("div", { className: "flex border" }), _jsx("h2", { className: "text-2xl font-semibold", children: "4. \u041E\u0431\u0449\u0430\u044F \u0446\u0435\u043D\u0430" }), _jsx("div", { children: _jsxs("h3", { children: ["\u041E\u0431\u0449\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u0437\u0430\u043A\u0430\u0437\u0430: ", _jsxs("span", { className: 'font-bold', children: [totalPrice.toNumber(), " \u0441\u043E\u043C"] })] }) }), _jsx("div", { className: 'w-full flex justify-end', children: _jsx(IButton, { type: "submit", disabled: isSubmitting, children: isSubmitting ? 'Отправка...' : 'Создать заказ' }) }), error && _jsxs("p", { className: "text-red-600 mt-2", children: ["\u041E\u0448\u0438\u0431\u043A\u0430: ", error] })] })] }) }) }));
};
export default CreateClientCorpOrder;
