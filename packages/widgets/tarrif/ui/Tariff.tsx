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
        <p className="absolute top-[-0.75rem] left-[0%] font-bold text-[5.5rem]">
          {data?.serviceLevel}
        </p>
        <p className="absolute top-[17.3333%] right-[0%] text-black/50 text-xl text-end">
          Цена: <br />
          <span className="text-7xl font-light text-black">{data?.price}с</span>
          {/* <br />
          <span>
            ({data?.price && exchangeRate ? (data.price / exchangeRate).toFixed(1) : '0.0'}$)
          </span> */}
        </p>
        <LazyImage
          src={`/images/tariff/${data.vehicleType.toLowerCase() || 'default'}.png`}
          alt={translatedVehicleType || 'Default Vehicle'}
          className={`w-[1000px] h-[1000px] aspect-video object-contain pointer-events-none select-none border-none ${data?.vehicleType === 'Minivan' || data?.vehicleType === 'Sprinter' ? 'h-[900] w-[900]' : ''}`}
        />
      </div>
    </div>
  );
};

export default Tariff;
