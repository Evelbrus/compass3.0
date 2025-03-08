'use client';

import React, { JSX, useState, useRef } from 'react';
import { DriverProfile } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { SafeUser } from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';
import { TextInput } from '@shared/components/ui/inputs';
import { handleTabChange } from '@shared/lib/navigation/handleTabChange';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';

interface UserWithDriverProfile extends SafeUser {
  driverProfile?: DriverProfile | null;
}

interface DriverDetailViewProps {
  userData: UserWithDriverProfile;
}

const DriverDetailView = ({ userData }: DriverDetailViewProps): JSX.Element => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: TabItem[] = [
    { id: 'personal', label: 'Основная информация' },
    { id: 'documents', label: 'Документы' },
    { id: 'details', label: 'Паспортные данные' },
    { id: 'address', label: 'Адреса' },
    { id: 'driver', label: 'Водительские данные' },
    { id: 'bank', label: 'Банковские данные' },
  ];

  const [activeTab, setActiveTab] = useState('personal');

  const onTabChange = (tabId: string) => {
    handleTabChange({ setActiveTab }, tabId, activeTab, scrollRef, false);
  };

  // Группируем поля пользователя парами
  const personalFieldPairs = [
    [
      { label: 'ФИО', value: userData.fullName },
      { label: 'Email', value: userData.email },
    ],
    [
      { label: 'Телефон', value: userData.phone },
      { label: 'Пол', value: userData.gender },
    ],
    [
      { label: 'Адрес', value: userData.address },
      { label: 'Доступность', value: userData.availability ? 'Доступен' : 'Недоступен' },
    ],
    [
      { label: 'Режим смены', value: userData.driverProfile?.changingDriver || 'Не указано' },
      { label: '', value: '' }, // Пустое поле для выравнивания
    ],
  ];

  // Группируем паспортные данные парами
  const passportFieldPairs = userData.driverProfile
    ? [
        [
          { label: 'Гражданство', value: userData.driverProfile.citizenship },
          { label: 'Документ удостоверения', value: userData.driverProfile.identityDocument },
        ],
        [
          { label: 'Номер паспорта', value: userData.driverProfile.passportId },
          {
            label: 'Дата выдачи паспорта',
            value: userData.driverProfile.passportIssueDate
              ? new Date(userData.driverProfile.passportIssueDate).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Не указано',
          },
        ],
        [
          { label: 'Кем выдан паспорт', value: userData.driverProfile.passportIssued },
          { label: 'Место рождения', value: userData.driverProfile.birthPlace },
        ],
        [
          {
            label: 'Дата рождения',
            value: userData.driverProfile.birthDate
              ? new Date(userData.driverProfile.birthDate).toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : 'Не указано',
          },
          { label: '', value: '' }, // Пустое поле для выравнивания
        ],
      ]
    : [];

  const addressFields = userData.driverProfile
    ? [
        { label: 'Фактический адрес', value: userData.driverProfile.actualAddress },
        { label: 'Адрес по прописке', value: userData.driverProfile.permanentAddress },
      ]
    : [];

  const drivingFields = userData.driverProfile
    ? [{ label: 'Стаж вождения (лет)', value: userData.driverProfile.yearsOfDriving }]
    : [];

  // Группируем банковские данные парами
  const bankFieldPairs = userData.driverProfile
    ? [
        [
          { label: 'Название банка', value: userData.driverProfile.bankName },
          { label: 'BIC банка', value: userData.driverProfile.bankBic },
        ],
        [
          { label: 'Номер счёта', value: userData.driverProfile.bankAccountNumber },
          { label: 'Номер карты', value: userData.driverProfile.cardNumber },
        ],
      ]
    : [];

  const profilePhotoUrl = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
    : null;

  const passportPhotoUrl = userData.driverProfile?.passportPhotoPath
    ? `/api/images/${userData.driverProfile.passportPhotoPath.split('/').pop()}?type=drivers/passport`
    : null;

  const licensePhotoUrl = userData.driverProfile?.licensePhotoPath
    ? `/api/images/${userData.driverProfile.licensePhotoPath.split('/').pop()}?type=drivers/license`
    : null;

  const driverProfilePhotoUrl = userData.driverProfile?.profilePhotoPath
    ? `/api/images/${userData.driverProfile.profilePhotoPath.split('/').pop()}?type=drivers/profile`
    : null;

  const handleEdit = () => {
    router.push(`/user/edit/${userData.uuid}`);
  };

  const noop = () => {};

  return (
    <div className="w-full flex flex-col px-5">
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
                {profilePhotoUrl ? (
                  <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                    <ImageUploadWithCrop
                      initialImage={profilePhotoUrl}
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
                <p className="text-xs text-gray-500 mt-3">Фотография водителя</p>
              </div>
            </div>

            <div className="w-2/3">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
                  Персональная информация
                </h3>
                <div className="p-6 space-y-4">
                  {personalFieldPairs.map((pair, pairIndex) => (
                    <div key={`personal-pair-${pairIndex}`} className="grid grid-cols-2 gap-4">
                      {pair.map((field, fieldIndex) =>
                        field.label ? (
                          <TextInput
                            key={`personal-field-${pairIndex}-${fieldIndex}`}
                            label={field.label}
                            value={field.value || 'Не указано'}
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

      {/* Документы */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center p-6 border-b">
            Документы водителя
          </h3>
          <div className="grid grid-cols-3 gap-6 p-6">
            <div className="flex flex-col items-center">
              <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[250px]">
                <ImageUploadWithCrop
                  initialImage={passportPhotoUrl || undefined}
                  mode="gallery"
                  aspect={4 / 3}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">Паспорт (лицевая сторона)</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[250px]">
                <ImageUploadWithCrop
                  initialImage={driverProfilePhotoUrl || undefined}
                  mode="gallery"
                  aspect={4 / 3}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">Паспорт (обратная сторона)</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[250px]">
                <ImageUploadWithCrop
                  initialImage={licensePhotoUrl || undefined}
                  mode="gallery"
                  aspect={4 / 3}
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">Водительское удостоверение</p>
            </div>
          </div>
        </div>
      )}

      {/* Паспортные данные */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
            Паспортные данные
          </h3>
          <div className="p-6 space-y-4">
            {passportFieldPairs.map((pair, pairIndex) => (
              <div key={`passport-pair-${pairIndex}`} className="grid grid-cols-2 gap-4">
                {pair.map((field, fieldIndex) =>
                  field.label ? (
                    <TextInput
                      key={`passport-field-${pairIndex}-${fieldIndex}`}
                      label={field.label}
                      value={field.value || 'Не указано'}
                      onChange={noop}
                      readOnly={true}
                      inputClass="bg-gray-50 font-medium"
                    />
                  ) : (
                    <div key={`passport-field-${pairIndex}-${fieldIndex}`}></div>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Адреса */}
      {activeTab === 'address' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
            Адреса проживания
          </h3>
          <div className="p-6 space-y-4">
            {addressFields.map((field, index) => (
              <TextInput
                key={`address-field-${index}`}
                label={field.label}
                value={field.value || 'Не указано'}
                onChange={noop}
                readOnly={true}
                inputClass="bg-gray-50 font-medium"
              />
            ))}
          </div>
        </div>
      )}

      {/* Водительские данные */}
      {activeTab === 'driver' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
            Водительские данные
          </h3>
          <div className="p-6 space-y-4">
            {drivingFields.map((field, index) => (
              <TextInput
                key={`driving-field-${index}`}
                label={field.label}
                value={field.value || 'Не указано'}
                onChange={noop}
                readOnly={true}
                inputClass="bg-gray-50 font-medium"
              />
            ))}
          </div>
        </div>
      )}

      {/* Банковские данные */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
            Банковские данные
          </h3>
          <div className="p-6 space-y-4">
            {bankFieldPairs.map((pair, pairIndex) => (
              <div key={`bank-pair-${pairIndex}`} className="grid grid-cols-2 gap-4">
                {pair.map((field, fieldIndex) => (
                  <TextInput
                    key={`bank-field-${pairIndex}-${fieldIndex}`}
                    label={field.label}
                    value={field.value || 'Не указано'}
                    onChange={noop}
                    readOnly={true}
                    inputClass="bg-gray-50 font-medium"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetailView;
