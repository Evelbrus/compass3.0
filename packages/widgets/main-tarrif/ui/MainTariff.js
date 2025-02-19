// import React from 'react';
// import { LazyImage } from '@shared/components/ui/images';
// import { IButton } from '@shared/components/ui/buttons';
// import { useUnit } from 'effector-react';
// import { $tariffs, $tariffsLoading, $tariffsError } from '@shared/lib/effector/tariff/tariffModel';
// import { ServiceLevels } from '@prisma/client';
//
// const MainTariff: React.FC = () => {
//   const tariffs = useUnit($tariffs);
//   const loading = useUnit($tariffsLoading);
//   const error = useUnit($tariffsError);
//
//   // Поиск основного тарифа (например, VIP-сервис)
//   const mainTariff = tariffs.find((tariff) =>
//     tariff.tariffPrices.some((price) => price.name === ServiceLevels.VIP),
//   );
//
//   if (loading) {
//     return <p className="text-center text-gray-500">Загрузка основного тарифа...</p>;
//   }
//
//   if (error) {
//     return <p className="text-center text-red-500">Ошибка загрузки: {error}</p>;
//   }
//
//   if (!mainTariff) {
//     return <p className="text-center text-gray-500">Основной тариф не найден.</p>;
//   }
//
//   const { name, clientType, vehicleTypes, tariffPrices } = mainTariff;
//
//   // Поиск цены для уровня VIP
//   const vipPrice = tariffPrices.find((price) => price.name === ServiceLevels.VIP)?.price || 0;
//
//   return (
//     <div className="w-full flex flex-col justify-between h-[423px] relative bg-white rounded-xl pt-8 px-8 shadow-lg">
//       <div className="flex flex-col">
//         <div className="flex flex-row justify-between">
//           <h1 className="text-[75px] leading-[90.77px] font-extrabold text-[#2A3037]">{name}</h1>
//           <div className="flex flex-col gap-1">
//             <p className="font-helvetica-neue text-end text-7 leading-7">
//               Тип клиента: <strong>{clientType}</strong>
//             </p>
//             <p className="font-helvetica-neue text-end text-7 leading-7">
//               Уровень обслуживания: <strong>VIP</strong>
//             </p>
//           </div>
//         </div>
//         <p className="font-helvetica-neue text-end text-6 leading-6 text-gray-500">Прайс:</p>
//         <h2 className="font-helvetica-neue text-end text-[114px] leading-[112.63px] font-light text-[#2A3037]">
//           {vipPrice}₽
//         </h2>
//       </div>
//       <LazyImage
//         src={`/images/tariff/${vehicleTypes[0]?.toLowerCase() || 'default'}.png`}
//         alt={vehicleTypes[0] || 'Default Vehicle'}
//         className="w-[968px] h-[375px] object-cover pointer-events-none select-none"
//       />
//       <div className="w-full flex justify-end">
//         <IButton
//           className="w-[200px] h-[54px] rounded-none rounded-t-lg border-none bg-[color:var(--button-secondary)]
//                   text-white font-semibold transition duration-300 ease-in-out
//                   hover:bg-[color:var(--button-secondary-hover)]"
//           textClassName="text-end text-4 leading-4 text-medium justify-center"
//           onClick={() => {
//             console.log('Редактирование тарифа');
//           }}
//         >
//           Редактировать
//         </IButton>
//       </div>
//     </div>
//   );
// };
//
// export default MainTariff;
