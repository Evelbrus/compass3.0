import { useSession } from '@shared/utils/hooks/useSession';
import { Column, TableDriversRow } from '@shared/components/ui/table';
import { renderCustomerPhone, renderDateTime } from '@shared/components/ui/table/ui/TableRenders';
import { UserRole } from '@prisma/client';

export const driversColumns: Column<TableDriversRow, keyof TableDriversRow>[] = [
  {
    accessor: 'number',
    header: '№',
    sortable: false,
    className: 'w-[100px] text-center',
  },
  {
    accessor: 'fullName',
    header: 'Телефон и ФИО',
    render: (row: TableDriversRow) => {
      if (row.fullName === null) {
        return 'Не указано';
      }
      return (
        <>
          {renderCustomerPhone(
            row.fullName.phone || 'Не указано',
            row.fullName.fullName || 'Не указано',
          )}
        </>
      );
    },
    sortable: true,
    className: 'w-[250px]',
  },
  {
    accessor: 'passportId',
    header: 'ID паспорта',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.passportId}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'passportPhotoPath',
    header: 'Фото паспорта',
    render: (row: TableDriversRow) => {
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
          } catch (error: any) {
            console.error('Ошибка скачивания:', error.message);
            alert(`Не удалось скачать файл: ${error.message}`);
          }
        } else {
          alert('Фото паспорта недоступно');
        }
      };

      return fullPhotoPath ? (
        isAdmin ? (
          <button
            onClick={handleDownloadPhoto}
            className="flex p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Скачать фото
          </button>
        ) : (
          <span className="text-gray-500">Доступ запрещен</span>
        )
      ) : (
        <span className="text-gray-500">Изображения паспорта нет</span>
      );
    },
    sortable: false,
    className: 'flex-grow text-center',
  },
  {
    accessor: 'yearsOfDriving',
    header: 'Опыт вождения',
    render: (row: TableDriversRow) => (
      <span>{row.yearsOfDriving !== null ? `${row.yearsOfDriving} лет` : 'Не указано'}</span>
    ),
    sortable: true,
    className: 'w-[160px]',
  },
  {
    accessor: 'companyName',
    header: 'Компания',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.companyName}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'partnerCompany',
    header: 'Партнер',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.partnerCompany}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'totalOrders',
    header: 'Кол-во заказов',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.totalOrders}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'totalFines',
    header: 'Кол-во штрафов',
    render: (row: TableDriversRow) => <span className="text-gray-800">{row.totalFines}</span>,
    sortable: true,
    className: 'w-[150px]',
  },
  {
    accessor: 'createdAt',
    header: 'Дата создания',
    render: (row: TableDriversRow) => renderDateTime(row.createdAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'updatedAt',
    header: 'Дата обновления',
    render: (row: TableDriversRow) => renderDateTime(row.updatedAt),
    sortable: true,
    className: 'w-[200px]',
  },
  {
    accessor: 'actions',
    header: 'Действия',
    render: (row: TableDriversRow) => row.actions,
    sortable: false,
    className: 'w-[200px]',
  },
];
