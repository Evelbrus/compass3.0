'use client';

import React, { useState, JSX } from 'react';
import CreateServiceLevel from '@pages/(client)/reference-books/service-levels/CreateServiceLevel';
import CreateAdditionalService from '@pages/(client)/reference-books/additional_service/CreateAdditionalService';
import CreatePoint from '@pages/(client)/reference-books/point/CreatePoint';

const ReferenceCreateBooks = (): JSX.Element => {
  const [activeTab, setActiveTab] = useState<string>('serviceLevels');

  return (
    <div>
      <h1>Admin Page</h1>
      <div>
        <button onClick={() => setActiveTab('serviceLevels')}>Create Service Level</button>
        <button onClick={() => setActiveTab('additionalServices')}>
          Create Additional Service
        </button>
        <button onClick={() => setActiveTab('points')}>Create Point</button>{' '}
      </div>
      <div>
        {activeTab === 'serviceLevels' && <CreateServiceLevel />}
        {activeTab === 'additionalServices' && <CreateAdditionalService />}
        {activeTab === 'points' && <CreatePoint />}
      </div>
    </div>
  );
};

export default ReferenceCreateBooks;
