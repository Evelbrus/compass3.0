import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const MAX_POINTS = 5;
const AdditionalPoints = ({ label, isOpen, searchValue, onOpenSelect, onSearchValueChange, search, handleSearchChange, filteredPoints, loading, onSelectPoint, selectorRef, observerRef, selectedPoints, onRemovePoint, onChangeOrder, onMaxLimitReached, totalAdditionalPrice, }) => {
    const selectedCount = selectedPoints.filter(Boolean).length;
    return (_jsxs("div", { className: "w-full relative", children: [_jsx("label", { className: 'flex p-2 border rounded-md bg-[#989898] text-white', children: label }), _jsxs("div", { className: "m-2 text-sm text-gray-500", children: ["\u041E\u0431\u0449\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C (", selectedCount, " \u0434\u043E\u043F. \u0442\u043E\u0447\u0435\u043A ", totalAdditionalPrice, "\u0441)"] }), _jsxs("div", { className: "mb-4", children: [_jsx("input", { type: "text", value: searchValue, onClick: () => {
                            if (selectedCount < MAX_POINTS) {
                                onOpenSelect();
                            }
                            else {
                                onMaxLimitReached();
                            }
                        }, onChange: (e) => onSearchValueChange(e.target.value), placeholder: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443...", className: "w-full p-2 border rounded cursor-pointer", readOnly: true }), isOpen && selectedCount < MAX_POINTS && (_jsxs("div", { className: "absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto", ref: selectorRef, children: [_jsx("input", { type: "text", autoFocus: true, value: search, onChange: handleSearchChange, placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "p-2 w-full border-b" }), filteredPoints.map((point) => (_jsx("div", { className: "p-2 cursor-pointer hover:bg-gray-100", onClick: () => {
                                    const emptyIndex = selectedPoints.findIndex((p) => p === null);
                                    if (emptyIndex !== -1) {
                                        onSelectPoint(point, emptyIndex);
                                    }
                                    console.log('нажал на город', point);
                                }, children: point.address }, point.uuid))), _jsx("div", { ref: observerRef, className: "p-2 text-center", children: loading ? 'Загрузка...' : '' })] }))] }), _jsx("div", { className: "space-y-2", children: Array.from({ length: MAX_POINTS }).map((_, index) => {
                    const point = selectedPoints[index];
                    return (_jsxs("div", { className: "flex flex-row gap-2", children: [_jsx("select", { value: index + 1, onChange: (e) => {
                                    const newIndex = Number(e.target.value) - 1;
                                    if (newIndex !== index) {
                                        onChangeOrder(index, newIndex);
                                    }
                                }, className: "p-2 border-2 rounded-md", children: Array.from({ length: MAX_POINTS }, (_, i) => (_jsx("option", { value: i + 1, children: i + 1 }, i))) }), _jsxs("div", { className: "w-full flex items-center justify-between p-2 border border-gray-300 rounded", children: [_jsx("div", { className: "flex-1", children: point ? (_jsx("span", { children: point.address })) : (_jsx("span", { className: "text-gray-400", children: "\u041F\u0443\u0441\u0442\u043E" })) }), point && (_jsx("button", { type: "button", onClick: () => onRemovePoint(index), className: "ml-2 text-red-500 hover:text-red-700", "aria-label": "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0443", children: "\u2715" }))] })] }, index));
                }) }), _jsx("div", { className: "mt-4 text-sm text-gray-500", children: "\u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0447\u0435\u0440\u0435\u0437 \u0441\u0435\u043B\u0435\u043A\u0442\u043E\u0440 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043E\u043A." })] }));
};
export default AdditionalPoints;
