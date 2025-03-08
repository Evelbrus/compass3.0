import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { ArrowIcon, InfoIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

export interface StatusItem {
  key: string;
  label: string;
  description: string;
  color: string;
}

export interface StatusOverviewProps<T = string> {
  selectedStatus: T | 'all';
  statusCounts: Record<string, number>;
  onSelectStatus: (status: T) => void;
  statusOverview: StatusItem[];
}

const StatusOverview = <T = string,>({
  selectedStatus,
  statusCounts,
  onSelectStatus,
  statusOverview,
}: StatusOverviewProps<T>) => {
  const handleStatusChange = (status: string) => {
    if (selectedStatus !== status) {
      onSelectStatus(status as unknown as T);
    }
  };

  return React.createElement(
    'div',
    { className: 'w-full flex flex-row overflow-y-hidden gap-4 justify-start px-5 pb-2' },
    statusOverview.map((status: StatusItem) => {
      const isSelected = selectedStatus === status.key;
      return React.createElement(
        IButton,
        {
          key: status.key,
          onClick: () => handleStatusChange(status.key),
          className:
            'border border-gray-200 relative w-full max-w-[300px] h-16 px-4 py-2 flex justify-between items-center gap-4 rounded-xl ' +
            'bg-white transition-all duration-300 ' +
            (isSelected
              ? 'opacity-100 cursor-default'
              : 'opacity-50 hover:bg-gray-200 hover:opacity-100 cursor-pointer'),
          customPrefix: React.createElement(AnimatedComponent, {
            className:
              'w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-lg ' +
              status.color,
            children: React.createElement(
              'span',
              { style: { textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)' } },
              statusCounts[status.key] || 0,
            ),
          }),
          buttonSuffix: React.createElement(ArrowIcon, {
            open: isSelected,
            isFilter: !isSelected,
            className: 'w-[20px] h-[10px]',
          }),
        },
        React.createElement('span', null, status.label),
        React.createElement(
          'div',
          { className: 'absolute top-1 right-1 group' },
          React.createElement(InfoIcon, {
            className: 'w-4 h-4 text-gray-400 hover:text-gray-800 cursor-pointer',
          }),
          React.createElement(
            'div',
            {
              className:
                'absolute top-16 right-0 mt-1 w-60 bg-gray-800 text-white text-start text-xs rounded-lg shadow-lg p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none',
            },
            status.description,
          ),
        ),
      );
    }),
  );
};

export default React.memo(StatusOverview) as <T>(
  props: StatusOverviewProps<T>,
) => React.ReactElement;
