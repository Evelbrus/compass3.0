'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const VehiclesDetail = ({ data }) => {
    const vehiclesDetails = [
        { label: 'UUID', value: data.uuid },
        { label: 'Type', value: data.vehicleType },
        { label: 'Brand', value: data.brand },
        { label: 'Model', value: data.model },
        { label: 'Year', value: data.year ? new Date(data.year).getFullYear() : 'N/A' },
        { label: 'Color', value: data.color },
        { label: 'Plate Number', value: data.plateNumber },
        { label: 'Availability', value: data.isAvailable ? 'Available' : 'Not Available' },
        { label: 'ownership', value: data.ownership },
    ];
    return (_jsxs("div", { className: "vehicle-detail-container", children: [_jsx("h1", { className: "text-2xl font-bold mb-4", children: "Vehicle Details" }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-6 bg-white shadow-md rounded-lg border border-gray-200", children: vehiclesDetails.map((item) => (_jsx(DetailItem, { label: item.label, value: item.value }, item.label))) }), data.photoPath && (_jsx("img", { src: data.photoPath, alt: `${data.brand} ${data.model}`, className: "mb-6 max-w-md rounded-lg shadow-md" })), _jsx(DriverSection, { drivers: data.vehicleDrivers })] }));
};
const DriverSection = ({ drivers }) => {
    return (_jsxs("div", { className: "mt-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Assigned Drivers" }), drivers.map((driver) => {
                const driverDetails = [
                    { label: 'Assignment UUID', value: driver.uuid },
                    { label: 'Assignment Date', value: driver.assignmentDate.toLocaleDateString() },
                    { label: 'Driver UUID', value: driver.driver.uuid },
                    { label: 'Full Name', value: driver.driver.fullName },
                    { label: 'Phone', value: driver.driver.phone },
                ];
                return (_jsx("div", { className: "bg-white p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 gap-4 rounded-lg shadow-md border border-gray-200", children: driverDetails.map(({ label, value }) => (_jsx(DetailItem, { label: label, value: value }, label))) }, driver.uuid));
            })] }));
};
export const DetailItem = ({ label, value, }) => (_jsxs("div", { className: "bg-white px-3 py-2 p-3 rounded-md border border-gray-300", children: [_jsxs("span", { className: "text-4 text-[#2A3037] font-extrabold mr-2", children: [label, ":"] }), _jsx("span", { className: "text-4 font-medium text-gray-500 mb-2", children: value })] }));
export default VehiclesDetail;
