import Link from 'next/link';
import { Metadata } from 'next';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

export const metadata: Metadata = {
  title: 'Страница не найдена | Мой Сайт',
  description: 'Страница не найдена',
};

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <LazyImage
        src="/404.webp"
        alt="No Found"
        className="w-[350px] h-[300px] object-cover"
        placeholder={<Skeleton width={350} height={300} />}
      />
      <h1 className="text-6xl font-extrabold text-[color:var(--text-black)] mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[color:var(--text-black)] mb-2">
        Страница не найдена
      </h2>
      <p className="font-medium text-[color:var(--text-black)] mb-6">
        Извините, но запрашиваемая вами страница не существует.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-md hover:bg-[color:var(--button-secondary-hover)] transition"
      >
        Вернуться на главную
      </Link>
    </div>
  );
};

export default NotFound;
