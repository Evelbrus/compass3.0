import React, { JSX } from 'react';
import { countryData } from './PhoneData';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

//ВАЖНО: импортируем SelectOption из одного места
import { SelectOption } from '@shared/lib/effector/types/types';

export const countryOptions: Array<SelectOption<string> & { compactLabel: JSX.Element }> =
  countryData.map((country) => ({
    value: country.code,

    //Основной label (подойдёт для селекта, если нужно показать полное название)
    label: (
      <div className="flex items-center whitespace-nowrap">
        <LazyImage
          src={country.flag}
          alt={country.name}
          className="w-[24px] h-[24px] object-cover"
          placeholder={<Skeleton width={24} height={24} />}
        />
        <span className="ml-2">
          {country.name} ({country.dialCode})
        </span>
      </div>
    ),

    //Для примера: compactLabel тоже храним, чтобы потом подменять label на короткий вариант
    compactLabel: (
      <div className="flex items-center whitespace-nowrap">
        <LazyImage
          src={country.flag}
          alt={country.name}
          className="w-[24px] h-[24px] object-cover mr-2"
          placeholder={<Skeleton width={24} height={24} />}
        />
        <span>
          {country.dialCode} {country.name}
        </span>
      </div>
    ),

    //Если нужна фильтрация по строке, добавим searchText = название страны
    //тогда в SelectSingle можно искать по searchText
    searchText: country.name + ' ' + country.dialCode,
  }));
