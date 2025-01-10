'use client';

import React, { useState, JSX } from 'react';
import AdditionalServices from '@pages/(administrator)/reference-books/additional_service/AdditionalServices';
import Points from '@pages/(administrator)/reference-books/point/Points';

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
        {activeTab === 'additionalServices' && <AdditionalServices />}
        {activeTab === 'points' && <Points />}
      </div>
    </div>
  );
};

export default ReferenceBooks;
