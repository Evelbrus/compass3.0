import { jsx as _jsx } from "react/jsx-runtime";
import Image from 'next/image';
const Icon = ({ name, alt, width = 24, height = 24, className }) => (_jsx(Image, { src: `/icons/${name}.svg`, alt: alt, width: width, height: height, className: className, loading: "lazy" }));
export default Icon;
