'use client';

import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { userCreationOptions } from '@shared/components/modal/create-user-modal';
import { UserRole } from '@prisma/client';

interface CreateUserModalProps {
  role: UserRole;
  onClose: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ role, onClose }) => {
  const router = useRouter();

  const handleNavigate = (route: string) => {
    router.push(route);
    onClose(); // Закрываем модальное окно после перехода
  };

  const filteredOptions = userCreationOptions.filter((option) => {
    if (role === UserRole.Operator) {
      return option.rolesAllowed.includes(role) && option.id !== 'admin';
    }
    return option.rolesAllowed.includes(role);
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-40">
      <AnimatedComponent duration={500}>
        <div className="bg-white rounded-3xl max-w-[1000px] w-full p-6 relative">
          <IButton
            variant="close"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>
          <h2 className="text-xl font-semibold mb-6 text-center">Создать пользователя</h2>
          <div className="flex gap-4 justify-center">
            {filteredOptions.map((option) => (
              <div
                key={option.id}
                className="flex flex-col justify-between p-4 border rounded-lg shadow hover:shadow-lg transition duration-300 max-w-[300px] w-full"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-36 h-36 mb-4 border rounded-md flex items-center justify-center bg-gray-100">
                    <img src={option.image} alt={option.title} className="w-24 h-24" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                <IButton
                  onClick={() => handleNavigate(option.route)}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  {option.buttonText}
                </IButton>
              </div>
            ))}
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default CreateUserModal;
