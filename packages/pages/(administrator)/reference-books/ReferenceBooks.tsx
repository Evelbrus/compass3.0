'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdditionalServices from '@pages/(administrator)/reference-books/additional_service/AdditionalServices';
import Points from '@pages/(administrator)/reference-books/point/Points';
import { IButton } from '@shared/components/ui/buttons';

const ReferenceBooks: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  //Читаем активную вкладку из URL или устанавливаем по умолчанию 'additionalServices'
  const initialTab = searchParams.get('tab') || 'additionalServices';
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [reset, setReset] = useState<boolean>(false);

  //Сбрасываем состояние reset при смене вкладки
  useEffect(() => {
    setReset(true);
  }, [activeTab]);

  //Функция для смены вкладки и обновления URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'additionalServices':
        return <AdditionalServices activeTab={activeTab} reset={reset} setReset={setReset} />;
      case 'points':
        return <Points activeTab={activeTab} reset={reset} setReset={setReset} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-row gap-6 p-5">
        <IButton onClick={() => handleTabChange('additionalServices')}>
          Дополнительные услуги
        </IButton>
        <IButton onClick={() => handleTabChange('points')}>Пункты прибытия</IButton>
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ReferenceBooks;
