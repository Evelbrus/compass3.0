'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { useUnit } from 'effector-react';
import { $pointUuid, setPointUuid } from '@shared/lib/effector/state/state';
const CreatePointModal = ({ onClose }) => {
    const uuid = useUnit($pointUuid);
    const [address, setAddress] = useState('');
    const [pricePerKm, setPricePerKm] = useState('');
    const [terrainDifficulty, setTerrainDifficulty] = useState('1.0');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    //Если это редактирование, загружаем данные точки
    useEffect(() => {
        if (uuid) {
            const fetchPoint = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/points/${uuid}`);
                    if (!response.ok)
                        throw new Error(`Ошибка загрузки точки: ${response.status}`);
                    const data = await response.json();
                    console.log('Полученные данные точки:', data);
                    if (!data.data || !data.data.point)
                        throw new Error('Данные точки отсутствуют в ответе');
                    const point = data.data.point;
                    setAddress(point.address);
                    setPricePerKm(point.pricePerKm.toString());
                    setTerrainDifficulty(point.terrainDifficulty.toString());
                    setLatitude(point.latitude.toString());
                    setLongitude(point.longitude.toString());
                }
                catch (err) {
                    console.error('Ошибка запроса:', err);
                    setError('Ошибка загрузки данных');
                }
                finally {
                    setLoading(false);
                }
            };
            fetchPoint();
        }
    }, [uuid]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!address || pricePerKm === '' || terrainDifficulty === '' || !latitude || !longitude) {
            setError('Все поля обязательны');
            return;
        }
        //Преобразуем строки в числа, проверяя на наличие десятичной точки
        const parsedPricePerKm = parseFloat(pricePerKm);
        const parsedTerrainDifficulty = parseFloat(terrainDifficulty);
        const parsedLatitude = parseFloat(latitude);
        const parsedLongitude = parseFloat(longitude);
        if (isNaN(parsedPricePerKm) ||
            isNaN(parsedTerrainDifficulty) ||
            isNaN(parsedLatitude) ||
            isNaN(parsedLongitude)) {
            setError('Некоторые числовые поля содержат некорректные значения');
            return;
        }
        setLoading(true);
        try {
            const method = uuid ? 'PUT' : 'POST';
            const url = uuid ? `/api/points/${uuid}` : '/api/points';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    pricePerKm: parsedPricePerKm,
                    terrainDifficulty: parsedTerrainDifficulty,
                    airport: false,
                    latitude: parsedLatitude,
                    longitude: parsedLongitude,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || `Ошибка ${uuid ? 'обновления' : 'создания'} точки`);
            }
            else {
                setSuccess(`Точка успешно ${uuid ? 'обновлена' : 'добавлена'}`);
                setTimeout(() => {
                    setPointUuid(null);
                    onClose();
                }, 1500);
            }
        }
        catch (err) {
            setError('Ошибка сервера');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: "w-[580px] max-h[600px] flex justify-center", children: _jsxs("div", { className: "bg-white rounded-3xl p-8 relative w-full", children: [_jsx(IButton, { variant: "close", onClick: () => {
                            setPointUuid(null);
                            onClose();
                        }, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsx("h2", { className: "text-2xl font-semibold mb-4", children: uuid ? 'Редактировать точку' : 'Добавить точку' }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441:", value: address, onChange: (value) => setAddress(value), required: true }), _jsx(TextInput, { label: "\u0426\u0435\u043D\u0430 \u0437\u0430 \u043A\u0438\u043B\u043E\u043C\u0435\u0442\u0440:", type: "number", value: pricePerKm, onChange: (value) => setPricePerKm(value), required: true, step: "0.01" }), _jsx(TextInput, { label: "\u041A\u043E\u044D\u0444\u0444\u0438\u0446\u0438\u0435\u043D\u0442 \u0441\u043B\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u043C\u0435\u0441\u0442\u043D\u043E\u0441\u0442\u0438:", type: "number", value: terrainDifficulty, onChange: (value) => setTerrainDifficulty(value), required: true, step: "0.1" }), _jsx(TextInput, { label: "\u0428\u0438\u0440\u043E\u0442\u0430 (Latitude):", type: "number", value: latitude, onChange: (value) => setLatitude(value), required: true, step: "0.000001" }), _jsx(TextInput, { label: "\u0414\u043E\u043B\u0433\u043E\u0442\u0430 (Longitude):", type: "number", value: longitude, onChange: (value) => setLongitude(value), required: true, step: "0.000001" }), error && _jsx("p", { className: "text-red-600", children: error }), success && _jsx("p", { className: "text-green-600", children: success }), _jsx("div", { className: 'w-full flex flex-row justify-end', children: _jsx(IButton, { type: "submit", disabled: loading, className: "w-[205px] p-4 bg-[color:var(--button-secondary)]\n                text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]\n                transition", children: loading ? 'Сохранение...' : uuid ? 'Обновить' : 'Создать' }) })] })] }) }) }));
};
export default CreatePointModal;
