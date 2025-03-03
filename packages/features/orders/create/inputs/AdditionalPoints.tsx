import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

interface AdditionalPointsProps {
  name: keyof FormOrderValues;
  onOpenSelect: () => void;
  selectedPoints: (PointWithoutTimestamps | null)[];
  onRemovePoint: (index: number) => void;
  onChangeOrder: (currentIndex: number, newIndex: number) => void;
  setAdditionalActiveIndex: (index: number | null) => void;
  activeIndex: number | null;
  closeDropdown: () => void;
}

const MAX_POINTS = 5;

const MARKER_COLORS = [
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

const HOVER_GRADIENTS = [
  'hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent',
  'hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent',
  'hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent',
  'hover:bg-gradient-to-r hover:from-cyan-50 hover:to-transparent',
  'hover:bg-gradient-to-r hover:from-pink-50 hover:to-transparent',
];

export const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
  name,
  onOpenSelect,
  selectedPoints,
  onRemovePoint,
  onChangeOrder,
  setAdditionalActiveIndex,
  activeIndex,
  closeDropdown,
}) => {
  const { control } = useFormContext<FormOrderValues>();

  const inputRefs = useRef<Array<HTMLDivElement | null>>([]);
  if (inputRefs.current.length !== MAX_POINTS) {
    inputRefs.current = Array(MAX_POINTS).fill(null);
  }

  const handleOpenSelect = (index: number) => {
    if (activeIndex === index) {
      closeDropdown();
      return;
    }
    setAdditionalActiveIndex(index);
    onOpenSelect();
  };

  const DropdownArrow = ({ isActive }: { isActive: boolean }) => (
    <svg
      className="w-5 h-5 text-gray-500 transition-transform duration-300 ease-in-out"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path
        d="M7 10L12 15L17 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="w-full relative overflow-auto">
          <div className="relative w-full">
            <div className="relative flex flex-col">
              {Array.from({ length: MAX_POINTS }).map((_, index) => {
                const point = selectedPoints[index];
                const letter = String.fromCharCode(67 + index);
                const markerColor = MARKER_COLORS[index];
                const hoverGradient = HOVER_GRADIENTS[index];
                const isActive = activeIndex === index;

                return (
                  <div key={index} className="relative">
                    <div
                      className={`flex items-center gap-3 p-3 ${hoverGradient} transition-all duration-200 cursor-pointer group border-b`}
                      onClick={() => handleOpenSelect(index)}
                      ref={(el) => void (inputRefs.current[index] = el)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full ${markerColor} text-white font-bold shadow-md`}
                        >
                          {letter}
                        </div>
                        <div className="relative">
                          <select
                            value={index + 1}
                            onChange={(e) => {
                              const newIndex = Number(e.target.value) - 1;
                              if (newIndex !== index) {
                                onChangeOrder(index, newIndex);
                                const updatedPoints = [...selectedPoints];
                                const currentPoint = updatedPoints[index] ?? null;
                                updatedPoints.splice(index, 1);
                                updatedPoints.splice(newIndex, 0, currentPoint);
                                field.onChange(updatedPoints);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-md w-14 text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 text-white"
                          >
                            {Array.from({ length: MAX_POINTS }, (_, i) => (
                              <option key={i} value={i + 1} className="text-black">
                                {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex-1 relative overflow-hidden">
                        <div className="relative w-full group-hover:opacity-90 transition-opacity">
                          <div
                            className={`w-full p-3 pl-0 rounded-md cursor-pointer flex items-center text-white whitespace-nowrap overflow-hidden text-ellipsis`}
                          >
                            {point ? point.address : `Выберите точку ${index + 1}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {point ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemovePoint(index);
                              const updatedPoints = [...selectedPoints];
                              updatedPoints[index] = null;
                              field.onChange(updatedPoints);
                            }}
                            className="text-red-500 hover:text-red-700 bg-gray-50/30 p-1 rounded-full hover:bg-red-50 transition duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M6 18L18 6M6 6l12 12"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        ) : (
                          <DropdownArrow isActive={isActive} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    />
  );
};
