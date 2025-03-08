import React from 'react';

const OrderDetailDriverModalSkeleton = () => {
  return (
    <div className="animate-pulse w-full max-w-3xl">
      {/*Заголовок */}
      <div className="bg-gray-200 rounded-md h-8 w-1/2 mb-4"></div>

      {/*Информация о заказе */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-md h-6 w-1/3 mb-2"></div>
        <div className="flex w-full gap-4">
          <div className="w-1/3">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
          <div className="w-1/3">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
          <div className="w-1/3">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
        </div>
      </div>

      {/*Информация о маршруте */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-md h-6 w-1/3 mb-2"></div>
        <div className="flex items-center p-4 border border-gray-300 rounded-md">
          <div className="w-[10px] h-[72px] mt-[24px] bg-gray-200"></div>
          <div className="flex flex-col w-full ml-2">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full mb-2"></div>
            <div className="bg-gray-300 h-[1px] w-full my-2"></div>
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
        </div>
      </div>

      {/*Информация о заказе (тариф, время) */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-md h-6 w-1/3 mb-2"></div>
        <div className="flex w-full gap-4">
          <div className="w-1/2">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
          <div className="w-1/2">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full flex items-center">
              <div className="w-[24px] h-[20px] bg-gray-300 mr-1"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </div>
        <div className="flex w-full gap-4 mt-2">
          <div className="w-1/2">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
          <div className="w-1/2">
            <div className="bg-gray-200 rounded-md h-4 w-1/2 mb-2"></div>
            <div className="bg-gray-200 rounded-md h-10 w-full"></div>
          </div>
        </div>
      </div>

      {/*Дополнительные услуги */}
      <div className="mb-4">
        <div className="bg-gray-200 rounded-md h-6 w-1/3 mb-2"></div>
        <div className="w-full">
          <div className="h-8 bg-gray-200 w-full rounded-md mb-2"></div>
          <div className="h-8 bg-gray-200 w-full rounded-md mb-2"></div>
          <div className="h-8 bg-gray-200 w-full rounded-md mb-2"></div>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="h-6 w-1/4 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailDriverModalSkeleton;
