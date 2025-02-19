import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LazyImage } from '@shared/components/ui/images';
import { vehicleTypeOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
const Tariff = ({ data }) => {
    //Используем метод find для поиска перевода типа транспортного средства
    const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === data.vehicleType);
    const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : data.vehicleType;
    return (_jsx("div", { className: "bg-white rounded-xl p-5", children: _jsxs("div", { className: "relative h-96 flex justify-center items-center", children: [_jsx("p", { className: "absolute top-[-0.75rem] left-[0%] font-bold text-[5.5rem]", children: data?.serviceLevel }), _jsxs("p", { className: "absolute top-[17.3333%] right-[0%] text-black/50 text-xl text-end", children: ["\u0426\u0435\u043D\u0430: ", _jsx("br", {}), _jsxs("span", { className: "text-7xl font-light text-black", children: [data?.price, "\u0441"] })] }), _jsx(LazyImage, { src: `/images/tariff/${data.vehicleType.toLowerCase() || 'default'}.png`, alt: translatedVehicleType || 'Default Vehicle', className: `w-[1000px] h-[1000px] aspect-video object-contain pointer-events-none select-none border-none ${data?.vehicleType === 'Minivan' || data?.vehicleType === 'Sprinter' ? 'h-[900] w-[900]' : ''}` })] }) }));
};
export default Tariff;
