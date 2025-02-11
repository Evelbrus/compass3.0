'use client';

import React from 'react';
import { useUnit } from 'effector-react';
import { $modalType, closeModal } from '@shared/lib/effector';
import { UserRole } from '@prisma/client';
import DeleteModal from '@shared/components/modal/delete-modal/DeleteModal';
import CreateUserModal from '@shared/components/modal/create-user-modal/ui/CreateUserModal';
import OrderDetailDriverModal from '@shared/components/modal/order-detail-driver-modal/OrderDetailDriverModal';
import CreateClientCorpOrder from '@shared/components/modal/create-client-corp-order/CreateClientCorpOrder';

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
      {modalType === 'orderDetailDriver' && <OrderDetailDriverModal />}
      {modalType === 'deleteModal' && <DeleteModal onClose={closeModal} />}
      {modalType === 'createClientCorpOrder' && <CreateClientCorpOrder onClose={closeModal} />}
    </>
  );
};

export default ModalManagerComponent;
