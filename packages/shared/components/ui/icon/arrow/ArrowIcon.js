import { jsx as _jsx } from "react/jsx-runtime";
const ArrowIcon = ({ open = false, isFilter = false, direction = 'desc', // По умолчанию вниз
...props }) => {
    let rotation = 'rotate(0deg)'; // По умолчанию вправо
    if (isFilter) {
        rotation = 'rotate(-90deg)'; // Поворот вправо для фильтра
    }
    else {
        if (direction === 'asc') {
            rotation = 'rotate(180deg)'; // Поворот вверх
        }
        else if (direction === 'desc') {
            rotation = 'rotate(0deg)'; // Поворот вниз
        }
    }
    return (_jsx("svg", { width: "10", height: "6", viewBox: "0 0 10 6", fill: "none", xmlns: "http://www.w3.org/2000/svg", style: {
            transform: rotation,
            transition: 'transform 0.2s ease',
        }, ...props, children: _jsx("path", { d: "M1 1L5 5L9 1", stroke: "#4B5563", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }) }));
};
export default ArrowIcon;
