import React from 'react';

type StaticHeaderProps = {
  additionalContent?: React.ReactNode;
};

export const StaticHeader = ({ additionalContent }: StaticHeaderProps) => {
  return (
    <header className="flex justify-between items-center h-[130px] max-h-[130px] w-full">
      <div className="w-full mx-4 flex items-center">{additionalContent}</div>
    </header>
  );
};
