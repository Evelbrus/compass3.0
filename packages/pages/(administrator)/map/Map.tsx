import Link from 'next/link';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

const Map = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LazyImage
        src="/404.webp"
        alt="No Found"
        className="w-[350px] h-[300px] object-cover"
        placeholder={<Skeleton width={350} height={300} />}
      />
      <h2 className="text-2xl font-bold text-[color:var(--text-black)] mb-2">Карта в разработке</h2>
      <Link
        href="/"
        className="px-6 py-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-md hover:bg-[color:var(--button-secondary-hover)] transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default Map;
