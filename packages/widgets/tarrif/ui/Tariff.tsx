// Tariff.tsx
import {
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';

interface TariffProps {
  data: DetailTariffData;
}

const Tariff: React.FC<TariffProps> = ({ data }) => {
  const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === data.vehicleType);
  const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : data.vehicleType;

  // Найдем соответствующий уровень сервиса и его перевод
  const serviceLevelOption = serviceLevelOptions.find(
    (option) => option.value === data.serviceLevel,
  );
  const translatedServiceLevel = serviceLevelOption ? serviceLevelOption.label : data.serviceLevel;

  return (
    <div className="relative bg-white rounded-xl p-5 h-96">
      <div className="relative h-full flex justify-center items-center z-20">
        <p className="absolute top-[-0.75rem] left-[0%] font-bold text-[5.5rem]">
          {translatedServiceLevel}
        </p>
        <p className="absolute top-[17.3333%] right-[0%] text-black/50 text-xl text-end">
          Цена: <br />
          <span className="text-7xl font-light text-black">{data?.price}с</span>
        </p>
      </div>
      <ImageUploadWithCrop
        initialImage={`/images/tariff/${data.vehicleType.toLowerCase() || 'default'}.png`}
        label={translatedVehicleType || 'Default Vehicle'}
        mode="view"
        aspect={16 / 9}
        containerWidth={'w-full'}
        containerHeight={'h-full'}
        className="absolute inset-0 z-10"
      />
    </div>
  );
};

export default Tariff;
