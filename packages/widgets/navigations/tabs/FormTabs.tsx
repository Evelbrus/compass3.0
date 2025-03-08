import React from 'react';

export interface TabItem {
  id: string;
  label: string;
}

interface FormTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabsRef?: React.Ref<HTMLDivElement>;
}

/**
 * Компонент для отображения вкладок формы
 */
const FormTabs: React.FC<FormTabsProps> = ({ tabs, activeTab, onTabChange, tabsRef }) => {
  return (
    <div className="w-full border-b border-[#E2E8F0] mb-6" ref={tabsRef}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default FormTabs;
