'use client';

import React from 'react';
import { useUnit } from 'effector-react';
import {
  $modalType,
  $activeNotification,
  closeModal,
} from '@shared/lib/effector';
import { UserRole} from '@prisma/client';
import {
  CreateUserModal,
  OrderDetailDriverModal,
  VehicleDetailModal,
  DeleteModal,
  ChangePasswordModal,
  CreateAdditionalServiceModal,
  CreatePointModal,
  OrderDriverModal,
  OrderTrackingModal,
  OrderAdminModal,
} from '@widgets/modal/index';

interface ModalManagerComponentProps {
  role: UserRole;
}

const ModalManagerComponent: React.FC<ModalManagerComponentProps> = ({ role }) => {
  const modalType = useUnit($modalType);
  const activeNotification = useUnit($activeNotification);

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
      {modalType === 'changePasswordModal' && <ChangePasswordModal onClose={closeModal} />}
      {modalType === 'createAdditionalServiceModal' &&
        (role === UserRole.Operator || role === UserRole.Admin) && (
          <CreateAdditionalServiceModal onClose={closeModal} />
        )}
      {modalType === 'createPointModal' &&
        (role === UserRole.Operator || role === UserRole.Admin) && (
          <CreatePointModal onClose={closeModal} />
        )}
      {modalType === 'orderDriverModal' && activeNotification && role === UserRole.Driver && (
        <OrderDriverModal
          isOpen={true}
          onClose={closeModal}
        />
      )}
      {modalType === 'orderTrackingModal' && activeNotification && role === UserRole.ClientCorp && (
        <OrderTrackingModal
          isOpen={true}
          onClose={closeModal}
        />
      )}
      {modalType === 'orderAdminModal' &&
        activeNotification &&
        (role === UserRole.Admin || role === UserRole.Operator) && (
          <OrderAdminModal
            isOpen={true}
            onClose={closeModal}
          />
        )}
    </>
  );
};

export default ModalManagerComponent;
