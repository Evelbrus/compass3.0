import React, { FC } from 'react';

interface HeaderOrderProps {
  uuid: string | undefined;
}

const HeaderOrder: FC<HeaderOrderProps> = ({ uuid }) => {
  return (
    <h1 className="text-2xl font-extrabold">
      {uuid ? `Редактирование заказа № ${uuid}` : 'Cоздание заказа'}
    </h1>
  );
};

export default HeaderOrder;
