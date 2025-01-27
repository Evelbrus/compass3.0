import React from 'react';
import { WelcomeIcon } from '@shared/components/ui/icon';

const Loading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <WelcomeIcon />
    </div>
  );
};

export default Loading;
