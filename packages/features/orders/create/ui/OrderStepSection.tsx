// src/features/orders/create/ui/OrderStepSection.tsx
import React, { FC, ReactNode, useState } from 'react';

export interface OrderStepConfig {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  isVisible?: boolean;
}

interface OrderStepSectionProps {
  step: OrderStepConfig;
  stepIndex: number;
  children: ReactNode;
  className?: string;
  customHeader?: ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const OrderStepSection: FC<OrderStepSectionProps> = ({
  step,
  stepIndex,
  children,
  className = '',
  customHeader,
  isCollapsible = false,
  defaultCollapsed = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (isCollapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <section className={`overflow-hidden border-b border-blue-100 ${className}`}>
      {/* Заголовок секции */}
      {customHeader || (
        <div
          className={`bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 ${isCollapsible ? 'cursor-pointer' : ''}`}
          onClick={toggleCollapse}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2 p-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                {stepIndex + 1}
              </span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{step.title}</h2>
                {step.description && (
                  <p className="text-blue-600 text-sm mt-1">{step.description}</p>
                )}
              </div>
            </div>

            {isCollapsible && (
              <button
                className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                aria-label={isCollapsed ? 'Развернуть' : 'Свернуть'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 transform transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isCollapsed ? 'M19 9l-7 7-7-7' : 'M19 9l-7 7-7-7'}
                  />
                </svg>
              </button>
            )}
          </div>

          {step.icon && <div className="mt-2">{step.icon}</div>}
        </div>
      )}

      <div
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[5000px] opacity-100'
        }`}
      >
        {children}
      </div>
    </section>
  );
};
