// 'use client';
//
// import React, { useEffect, useState } from 'react';
// import { TextInput } from '@shared/components/ui/inputs';
// import useDebounce from '@shared/utils/hooks/useDebounce';
// import { LazyImage } from '@shared/components/ui/images';
// import Pagination from '@shared/components/ui/pagination/Pagination';
// import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
//
// type DriversNearbyProps = {
//   data: GetDriversRow[];
//   vehicleTypes: string[];
// };
//
// const DriversNearby: React.FC<DriversNearbyProps> = ({ data, vehicleTypes }) => {
//   const [search, setSearch] = useState('');
//   const debouncedSearch = useDebounce(search, 500);
//   const [searchResult, setSearchResult] = useState<GetDriversRow[]>(data);
//   const [pageNumber, setPageNumber] = useState<number>(1);
//   const pageSize = 4;
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [displayDrivers, setDisplayDrivers] = useState<GetDriversRow[]>([]);
//   const animationDuration = 300;
//
//   //Фильтрация водителей по поиску и типам автомобилей
//   const filteredDrivers = (searchQuery: string, dataSet: GetDriversRow[]) => {
//     let filteredData = dataSet;
//
//     //Фильтруем по типу автомобиля
//     if (vehicleTypes.length > 0) {
//       filteredData = filteredData.filter((driver) =>
//         driver.vehicleDriver?.some((type) => vehicleTypes.includes(type)),
//       );
//     }
//
//     //Фильтруем по поисковому запросу
//     if (searchQuery.trim() !== '') {
//       filteredData = filteredData.filter((driver) => {
//         const fullName = driver.fullName?.toLowerCase() || '';
//         const phone = driver.phone?.toLowerCase() || '';
//         const query = searchQuery.toLowerCase();
//         return fullName.includes(query) || phone.includes(query);
//       });
//     }
//
//     return filteredData;
//   };
//
//   useEffect(() => {
//     setIsAnimating(true);
//     const timer = setTimeout(() => {
//       const filtered = filteredDrivers(debouncedSearch, data);
//       setSearchResult(filtered);
//       setPageNumber(1);
//       setTimeout(() => {
//         const newCurrentDrivers = filtered.slice(0, pageSize);
//         setDisplayDrivers(newCurrentDrivers);
//         setIsAnimating(false);
//       }, animationDuration);
//     }, animationDuration);
//     return () => clearTimeout(timer);
//   }, [debouncedSearch, data]);
//
//   useEffect(() => {
//     setIsAnimating(true);
//     const timer = setTimeout(() => {
//       const newCurrentDrivers = searchResult.slice(
//         (pageNumber - 1) * pageSize,
//         pageNumber * pageSize,
//       );
//       setDisplayDrivers(newCurrentDrivers);
//       setIsAnimating(false);
//     }, animationDuration);
//     return () => clearTimeout(timer);
//   }, [pageNumber, searchResult]);
//
//   const totalCount = searchResult.length;
//   const totalPages = Math.ceil(totalCount / pageSize);
//
//   return (
//     <div className="w-full h-full flex flex-col justify-between gap-4 min-h-[516px]">
//       <div className="w-full flex flex-col gap-4">
//         <h1 className="text-2xl font-extrabold leading-4">Водители поблизости</h1>
//         <div className="w-full flex flex-col">
//           <TextInput
//             value={search}
//             onChange={(value: string) => setSearch(value)}
//             className="rounded-lg p-4 border-1 border-gray-200 shadow-sm"
//             disabled={false}
//             placeholder="Поиск по ФИО или телефону"
//           />
//         </div>
//
//         {displayDrivers.length > 0 ? (
//           <AnimatedComponent
//             visible={!isAnimating}
//             duration={animationDuration}
//             className="w-full bg-white rounded-lg"
//           >
//             <ul className="w-full bg-white rounded-lg">
//               {displayDrivers.map((driver) => (
//                 <li
//                   key={driver.uuid}
//                   className="relative p-4 border flex items-center justify-between gap-4"
//                 >
//                   <span className="absolute top-1 inset-0 flex justify-center text-[12px] font-medium leading-3">
//                     {driver.driverProfile?.status ? 'Онлайн' : 'Оффлайн'}
//                   </span>
//                   <div className="flex flex-row gap-4">
//                     <div className="relative">
//                       <LazyImage
//                         src={
//                           driver.driverProfile?.profilePhotoPath
//                             ? driver.driverProfile.profilePhotoPath
//                             : '/assets/default-user.png'
//                         }
//                         alt={driver.fullName || ''}
//                         className="w-[52px] h-[52px] rounded-full object-cover"
//                       />
//                       <span
//                         className={`absolute top-0 left-0 w-4 h-4 rounded-full border-2 border-white ${
//                           driver.driverProfile?.status ? 'bg-green-500' : 'bg-red-500'
//                         }`}
//                       ></span>
//                     </div>
//                     <div className="flex flex-col items-start justify-center">
//                       <p className="text-[20px] font-light text-black">{driver.fullName}</p>
//                       <p className="font-medium text-[16px] leading-4 text-gray-500">
//                         + {driver.phone}
//                       </p>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </AnimatedComponent>
//         ) : (
//           debouncedSearch.trim() !== '' && (
//             <div className="mt-4">
//               <p>Водители не найдены по вашему запросу.</p>
//             </div>
//           )
//         )}
//       </div>
//       <Pagination
//         pageNumber={pageNumber}
//         pageSize={pageSize}
//         totalCount={totalCount}
//         setPageNumber={setPageNumber}
//       />
//     </div>
//   );
// };
//
// export default DriversNearby;
