import React from 'react';

const OrderMapPreview: React.FC = () => {
  const mapBackgroundUrl = 'https://miro.medium.com/max/1400/1*qYUvh-EtES8dtgKiBRiLsA.png';

  return (
    <div className="h-36 bg-gray-200 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gray-300 opacity-50">
        <div
          className="h-full w-full"
          style={{
            background: `url('${mapBackgroundUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(1) opacity(0.7)',
          }}
        ></div>
      </div>
      <button
        className="z-10 px-4 py-2 bg-white text-blue-700 rounded-lg shadow-md font-medium"
        aria-label="Открыть карту маршрута"
      >
        Открыть карту
      </button>
    </div>
  );
};

export default React.memo(OrderMapPreview);
