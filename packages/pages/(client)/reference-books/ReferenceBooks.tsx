'use client';

import React, { useState, JSX } from 'react';
import ServiceLevels from '@pages/(client)/reference-books/service-levels/ServiceLevels';
import AdditionalServices from '@pages/(client)/reference-books/additional_service/AdditionalServices';
import Points from '@pages/(client)/reference-books/point/Points';

const ReferenceBooks = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>('serviceLevels');

  return (
    <div>
      <h1>Admin Page</h1>
      <div className={'flex flex-row gap-6'}>
        <button onClick={() => setActiveTab('serviceLevels')}>Service Levels</button>
        <button onClick={() => setActiveTab('additionalServices')}>Additional Services</button>
        <button onClick={() => setActiveTab('points')}>Points</button>{' '}
      </div>
      <div>
        {activeTab === 'serviceLevels' && <ServiceLevels />}
        {activeTab === 'additionalServices' && <AdditionalServices />}
        {activeTab === 'points' && <Points />}
      </div>
    </div>
  );
};

export default ReferenceBooks;
