//StaticHeader.tsx (entities/header)
import React from 'react';

type StaticHeaderProps = {
  additionalContent?: React.ReactNode;
};

export const StaticHeader = ({ additionalContent }: StaticHeaderProps) => {
  return (
    <header className="p-4 flex justify-between items-center max-h-[300px] relative">
      <div className="w-full flex items-center space-x-4">{additionalContent}</div>
    </header>
  );
};
