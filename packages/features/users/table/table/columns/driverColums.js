import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useSession } from '@shared/utils/hooks/useSession';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
import { UserRole } from '@prisma/client';
export const driversColumns = [
    {
        accessor: 'number',
        header: '№',
        sortable: false,
        className: 'w-[100px] text-center',
    },
    {
        accessor: 'fullName',
        header: 'Телефон и ФИО',
        render: (row) => {
            if (row.fullName === null) {
                return 'Не указано';
            }
            return (_jsx(_Fragment, { children: renderCustomerPhone(row.fullName.phone || 'Не указано', row.fullName.fullName || 'Не указано') }));
        },
        sortable: true,
        className: 'w-[350px]',
    },
    {
        accessor: 'passportId',
        header: 'ID паспорта',
        render: (row) => _jsx("span", { className: "text-gray-800", children: row.passportId }),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'passportPhotoPath',
        header: 'Фото паспорта',
        render: (row) => {
            const baseUrl = 'http://localhost:3008';
            const fileName = row.passportPhotoPath ? row.passportPhotoPath.split('/').pop() || '' : '';
            const fullPhotoPath = fileName
                ? `${baseUrl}/api/images/${encodeURIComponent(fileName)}?type=drivers/passport`
                : null;
            const session = useSession();
            const isAdmin = session.userSession?.role === UserRole.Admin;
            const handleDownloadPhoto = async () => {
                if (!isAdmin) {
                    alert('Доступ запрещен. Только админ может скачивать фото.');
                    return;
                }
                if (fullPhotoPath) {
                    try {
                        const response = await fetch(fullPhotoPath, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
                        }
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `passport_photo_${row.number}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }
                    catch (error) {
                        console.error('Ошибка скачивания:', error.message);
                        alert(`Не удалось скачать файл: ${error.message}`);
                    }
                }
                else {
                    alert('Фото паспорта недоступно');
                }
            };
            return fullPhotoPath ? (isAdmin ? (_jsx("button", { onClick: handleDownloadPhoto, className: "flex p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300", children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0444\u043E\u0442\u043E" })) : (_jsx("span", { className: "text-gray-500", children: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" }))) : (_jsx("span", { className: "text-gray-500", children: "\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430 \u043D\u0435\u0442" }));
        },
        sortable: false,
        className: 'flex-grow text-center',
    },
    {
        accessor: 'createdAt',
        header: 'Дата создания',
        render: (row) => renderDateTime(row.createdAt),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'updatedAt',
        header: 'Дата обновления',
        render: (row) => renderDateTime(row.updatedAt),
        sortable: true,
        className: 'w-[200px]',
    },
    {
        accessor: 'actions',
        header: 'Действия',
        render: (row) => row.actions,
        sortable: false,
        className: 'w-[200px]',
    },
];
