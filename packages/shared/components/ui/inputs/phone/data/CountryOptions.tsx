import React from 'react';
import { countryData } from './PhoneData';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

export const countryOptions = countryData.map((country) => ({
  value: country.code,
  label: (
    <div className="flex items-center whitespace-nowrap">
      <div className="flex-shrink-0">
        <LazyImage
          src={country.flag}
          alt={country.name}
          className="w-[24px] h-[24px] object-cover"
          placeholder={<Skeleton width={24} height={24} />}
        />
      </div>
      <span className="ml-2">
        {country.name} ({country.dialCode})
      </span>
    </div>
  ),

  compactLabel: (
    <div className="flex items-center whitespace-nowrap">
      <div className="flex-shrink-0">
        <LazyImage
          src={country.flag}
          alt={country.name}
          className="w-[24px] h-[24px] object-cover mr-2"
          placeholder={<Skeleton width={24} height={24} />}
        />
      </div>
      <span>
        {country.dialCode} {country.name}
      </span>
    </div>
  ),
}));
