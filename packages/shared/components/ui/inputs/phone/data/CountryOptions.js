import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { countryData } from './PhoneData';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
export const countryOptions = countryData.map((country) => ({
    value: country.code,
    label: (_jsxs("div", { className: "flex items-center whitespace-nowrap", children: [_jsx(LazyImage, { src: country.flag, alt: country.name, className: "w-[24px] h-[24px] object-cover", placeholder: _jsx(Skeleton, { width: 24, height: 24 }) }), _jsxs("span", { className: "ml-2", children: [country.name, " (", country.dialCode, ")"] })] })),
    compactLabel: (_jsxs("div", { className: "flex items-center whitespace-nowrap", children: [_jsx(LazyImage, { src: country.flag, alt: country.name, className: "w-[24px] h-[24px] object-cover mr-2", placeholder: _jsx(Skeleton, { width: 24, height: 24 }) }), _jsxs("span", { children: [country.dialCode, " ", country.name] })] })),
    searchText: country.name + ' ' + country.dialCode,
}));
