import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compass',
  description: 'Compass Manas.',
  metadataBase: new URL('https://yourdomain.com'),
  openGraph: {
    title: 'Название для Open Graph',
    description: 'Описание для Open Graph',
    url: 'https://yourdomain.com',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 800,
        height: 600,
        alt: 'Описание изображения для социальных сетей',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compass Manas',
    description: 'Compass Manas',
    images: ['https://yourdomain.com/twitter-image.jpg'],
  },
};
