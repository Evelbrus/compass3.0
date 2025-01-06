import React from 'react';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = '15px' }) => {
  return (
    <div
      className="relative overflow-hidden flex items-center justify-center"
      style={{
        width: typeof width === 'string' ? width : `${width}px`,
        height: typeof height === 'string' ? height : `${height}px`,
        borderRadius,
      }}
    >
      <div
        className="absolute top-0 left-0 h-full w-[150px] via-gray-100 to-gray-300 animate-pulse"
        style={{
          animation: 'pulse 2s infinite ease-in-out',
        }}
      />
    </div>
  );
};
