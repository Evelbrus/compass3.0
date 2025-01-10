'use client';

import React, { useState, JSX } from 'react';
import CreateAdditionalService from '@pages/(administrator)/reference-books/additional_service/CreateAdditionalService';
import CreatePoint from '@pages/(administrator)/reference-books/point/CreatePoint';

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
        {activeTab === 'additionalServices' && <CreateAdditionalService />}
        {activeTab === 'points' && <CreatePoint />}
      </div>
    </div>
  );
};

export default ReferenceCreateBooks;
