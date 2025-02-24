'use client';

import React from 'react';
import { useUnit } from 'effector-react';
import { $modalType, closeModal } from '@shared/lib/effector';
import { UserRole } from '@prisma/client';
import DeleteModal from '@shared/components/modal/delete-modal/DeleteModal';
import CreateUserModal from '@shared/components/modal/create-user-modal/ui/CreateUserModal';
import OrderDetailDriverModal from '@shared/components/modal/order-detail-driver-modal/OrderDetailDriverModal';
import CreateClientCorpOrder from '@shared/components/modal/create-client-corp-order/CreateClientCorpOrder';
import ChangePasswordModal from '@shared/components/modal/change-password-modal/ChangePasswordModal';
import CreateAdditionalServiceModal from '@shared/components/modal/create-additional-service-modal/CreateAdditionalServiceModal';
import CreatePointModal from '@shared/components/modal/create-point-modal/CreatePointModal';
import VehicleDetailModal from '@shared/components/modal/vehicle-detail-modal/VehicleDetailModal';

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
      {modalType === 'vehicleDetail' && <VehicleDetailModal />}
      {modalType === 'deleteModal' && (role === UserRole.Operator || role === UserRole.Admin) && (
        <DeleteModal onClose={closeModal} />
      )}
      {modalType === 'createClientCorpOrder' && role === UserRole.ClientCorp && (
        <CreateClientCorpOrder onClose={closeModal} />
      )}
      {modalType === 'changePasswordModal' && <ChangePasswordModal onClose={closeModal} />}
      {modalType === 'createAdditionalServiceModal' &&
        (role === UserRole.Operator || role === UserRole.Admin) && (
          <CreateAdditionalServiceModal onClose={closeModal} />
        )}
      {modalType === 'createPointModal' &&
        (role === UserRole.Operator || role === UserRole.Admin) && (
          <CreatePointModal onClose={closeModal} />
        )}
    </>
  );
};

export default ModalManagerComponent;
