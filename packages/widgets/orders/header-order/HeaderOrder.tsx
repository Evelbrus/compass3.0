import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface HeaderOrderProps {
  uuid: string | undefined;
}

const HeaderOrder: React.FC<HeaderOrderProps> = ({ uuid }) => {
  const { control } = useFormContext();

  //Отслеживаем поле createdAt с помощью useWatch
  const createdAt = useWatch({
    control,
    name: 'createdAt',
  });

  const formatDate = (date: Date | string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(2);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}${month}${year}${hours}${minutes}`;
  };

  return (
    <>
      <h1 className="text-2xl font-extrabold">
        {uuid
          ? `Редактирование заказа № ${createdAt ? formatDate(createdAt) : 'неизвестно'}`
          : 'Создание заказа'}
      </h1>
    </>
  );
};

export default HeaderOrder;
