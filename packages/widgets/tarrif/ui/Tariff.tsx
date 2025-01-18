import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';
import { vehicleTypeOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';

interface TariffProps {
  data: DetailTariffData;
}

const Tariff: React.FC<TariffProps> = ({ data }) => {
  //Используем метод find для поиска перевода типа транспортного средства
  const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === data.vehicleType);
  const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : data.vehicleType;

  return (
    <div className="bg-white rounded-xl p-5">
      <div className="relative h-96 flex justify-center items-center">
        <p className="absolute top-5 left-[5%] font-bold text-8xl">{data?.serviceLevel}</p>
        <p className="absolute top-1/3 right-[5%] text-black/50 text-xl">
          Цена: <br />
          <span className="text-7xl font-medium text-black">{data?.price}с</span>
        </p>
        <LazyImage
          src={`/images/tariff/${data.vehicleType.toLowerCase() || 'default'}.png`}
          alt={translatedVehicleType || 'Default Vehicle'}
          className="w-[800px] h-[800px] aspect-video object-contain pointer-events-none select-none border-none"
        />
      </div>
      <div className="flex justify-end gap-1">
        <IButton className="border rounded-3xl p-5">{data?.vehicleType}</IButton>
        <IButton className="border rounded-3xl p-5 bg-black text-white">Редактировать</IButton>
      </div>
    </div>
  );
};

export default Tariff;
