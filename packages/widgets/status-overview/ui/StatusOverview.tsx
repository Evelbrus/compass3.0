'use client';

import React, { useEffect } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { ArrowIcon, InfoIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { StatusOverviewProps } from '@widgets/status-overview';

const StatusOverview: React.FC<StatusOverviewProps> = ({
  selectedStatus,
  statusCounts,
  onSelectStatus,
  statusOverview,
}) => {
  useEffect(() => {
    if (!selectedStatus && statusOverview.length > 0) {
      onSelectStatus(statusOverview[0].key);
    }
  }, [selectedStatus, onSelectStatus, statusOverview]);

  const handleStatusChange = (status: string) => {
    if (selectedStatus !== status) {
      onSelectStatus(status);
    }
  };

  return (
    <div className="w-full grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-2">
      {statusOverview.map((status) => {
        const isSelected = selectedStatus === status.key;

        return (
          <IButton
            key={status.key}
            onClick={() => handleStatusChange(status.key)}
            className={`relative h-16 px-4 py-2 flex justify-between items-center gap-4 rounded-xl 
    bg-white transition-all duration-300 
    ${isSelected ? 'opacity-100' : 'opacity-50 hover:bg-gray-200 hover:opacity-100'}
    ${isSelected ? 'cursor-default' : 'cursor-pointer'}`}
            customPrefix={
              <AnimatedComponent
                className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-lg 
                ${status.color}`}
              >
                <span style={{ textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                  {statusCounts[status.key] || 0}
                </span>
              </AnimatedComponent>
            }
            buttonSuffix={
              <ArrowIcon open={isSelected} isFilter={!isSelected} className="w-[20px] h-[10px]" />
            }
          >
            <span>{status.label}</span>
            <div className="absolute top-1 right-1 group">
              <InfoIcon className="w-4 h-4 text-gray-400 hover:text-gray-800 cursor-pointer" />
              <div className="absolute top-16 right-0 mt-1 w-60 bg-gray-800 text-white text-start text-xs rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                {status.description}
              </div>
            </div>
          </IButton>
        );
      })}
    </div>
  );
};

export default React.memo(StatusOverview);
