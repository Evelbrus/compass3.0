import React from 'react';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page: React.FC<PageProps> = async () => {
  redirect('/');
};

export default Page;
