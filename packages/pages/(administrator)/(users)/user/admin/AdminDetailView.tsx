'use client';

import React, { JSX, useState, useRef } from 'react';
import { SafeUser } from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';
import { useRouter } from 'next/navigation';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { TextInput } from '@shared/components/ui/inputs';
import { handleTabChange } from '@shared/lib/navigation/handleTabChange';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';

interface AdminDetailViewProps {
  userData: SafeUser;
}

const AdminDetailView = ({ userData }: AdminDetailViewProps): JSX.Element => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: TabItem[] = [{ id: 'personal', label: 'Основная информация' }];

  const [activeTab, setActiveTab] = useState('personal');

  const onTabChange = (tabId: string) => {
    handleTabChange({ setActiveTab }, tabId, activeTab, scrollRef, false);
  };

  // Группируем поля пользователя парами для более логичной структуры
  const userFieldPairs = [
    [
      { label: 'ФИО', value: userData.fullName },
      { label: 'Email', value: userData.email },
    ],
    [
      { label: 'Телефон', value: userData.phone },
      { label: 'Роль', value: userData.role },
    ],
    [
      { label: 'Пол', value: userData.gender },
      { label: 'Доступность', value: userData.availability ? 'Доступен' : 'Недоступен' },
    ],
    [
      { label: 'Адрес', value: userData.address },
      { label: '', value: '' }, // Пустое поле для выравнивания
    ],
  ];

  const userImageSrc = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
    : null;

  const handleEdit = () => {
    router.push(`/user/edit/${userData.uuid}`);
  };

  const noop = () => {};

  return (
    <div className="w-full flex flex-col p-5">
      <div className="flex items-center justify-end">
        <button
          onClick={handleEdit}
          className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
          Редактировать
        </button>
      </div>

      <div ref={scrollRef}>
        <FormTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      {/* Основная информация */}
      {activeTab === 'personal' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Фото профиля</h3>
              <div className="flex flex-col items-center">
                {userImageSrc ? (
                  <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                    <ImageUploadWithCrop
                      initialImage={userImageSrc}
                      mode="gallery"
                      aspect={1}
                    />
                  </div>
                ) : (
                  <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">Фотография администратора</p>
              </div>
            </div>

            <div className="w-2/3">
              <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
                Персональная информация
              </h3>
                <div className="p-6 space-y-4">
                  {userFieldPairs.map((pair, pairIndex) => (
                    <div key={`personal-pair-${pairIndex}`} className="grid grid-cols-2 gap-4">
                      {pair.map((field, fieldIndex) =>
                        field.label ? (
                          <TextInput
                            key={`personal-field-${pairIndex}-${fieldIndex}`}
                            label={field.label}
                            value={field.value ?? 'Не указано'}
                            onChange={noop}
                            readOnly={true}
                            inputClass="bg-gray-50 font-medium"
                          />
                        ) : (
                          <div key={`personal-field-${pairIndex}-${fieldIndex}`}></div>
                        ),
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDetailView;
