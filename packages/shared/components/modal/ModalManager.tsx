'use client';

import React from 'react';
import { useUnit } from 'effector-react';
import { $modalType, closeModal } from '@shared/lib/effector';
import 'react-toastify/dist/ReactToastify.css';
import DeleteModal from '@shared/components/modal/delete-modal/DeleteModal';
import CreateUserModal from '@shared/components/modal/create-user-modal/ui/CreateUserModal';
import { UserRole } from '@prisma/client';

interface ModalManagerComponentProps {
  role: UserRole;
}

const ModalManagerComponent: React.FC<ModalManagerComponentProps> = ({ role }) => {
  const modalType = useUnit($modalType);

  return (
    <>
      {modalType === 'createUserModal' &&
        (role === UserRole.Admin || role === UserRole.Operator) && (
          <CreateUserModal role={role} onClose={closeModal} />
        )}
      {modalType === 'deleteModal' && <DeleteModal onClose={closeModal} />}
    </>
  );
};

export default ModalManagerComponent;
