'use client';

import React, { useEffect, useState } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter, useSearchParams } from 'next/navigation';
import Points from '@pages/(administrator)/reference-books/point/Points';
import AdditionalServices from '@pages/(administrator)/reference-books/additional_service/AdditionalServices';

interface ReferenceBooksProps {
  initialTab: 'additionalServices' | 'points';
}

const ReferenceBooks: React.FC<ReferenceBooksProps> = ({ initialTab }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'additionalServices' | 'points'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'points' || tab === 'additionalServices') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleNavigateToAdditionalServices = () => {
    router.push('/reference-book/additional-services');
  };

  const handleNavigateToPoints = () => {
    router.push('/reference-book/points');
  };

  return (
    <div>
      <div className="flex flex-row gap-6 p-5">
        <IButton onClick={handleNavigateToAdditionalServices}>Дополнительные услуги</IButton>
        <IButton onClick={handleNavigateToPoints}>Пункты прибытия</IButton>
      </div>
      {activeTab === 'additionalServices' && <AdditionalServices />}
      {activeTab === 'points' && <Points />}
    </div>
  );
};

export default ReferenceBooks;
