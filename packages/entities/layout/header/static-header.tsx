import React from 'react';

type StaticHeaderProps = {
  additionalContent?: React.ReactNode;
};

export const StaticHeader = ({ additionalContent }: StaticHeaderProps) => {
  return (
    <header className="p-4 flex justify-between items-center h-[100px] max-h-[100px] relative">
      <div className="w-full flex items-center space-x-4">{additionalContent}</div>
    </header>
  );
};
