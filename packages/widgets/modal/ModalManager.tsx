'use client';

import React from 'react';
import { useUnit } from 'effector-react';
import {
  $modalType,
  $activeNotification,
  $warningModalProps,
  closeModal,
} from '@shared/lib/effector';
import { UserRole} from '@prisma/client';
import { UserSession } from '@shared/prisma/interface/users/interface';
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
  WarningModal,
} from '@widgets/modal/index';

interface ModalManagerComponentProps {
  role: UserRole;
  userSession: UserSession | null;
}

const ModalManagerComponent: React.FC<ModalManagerComponentProps> = ({ role, userSession }) => {
  const modalType = useUnit($modalType);
  const activeNotification = useUnit($activeNotification);
  const warningModalProps = useUnit($warningModalProps); // Добавляем получение пропсов для WarningModal

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
          notification={activeNotification}
          userRole={role}
          userSession={userSession}
        />
      )}
      {modalType === 'orderTrackingModal' && activeNotification && role === UserRole.ClientCorp && (
        <OrderTrackingModal
          isOpen={true}
          onClose={closeModal}
          notification={activeNotification}
          userRole={role}
          userSession={userSession}
        />
      )}
      {modalType === 'orderAdminModal' &&
        activeNotification &&
        (role === UserRole.Admin || role === UserRole.Operator) && (
          <OrderAdminModal
            isOpen={true}
            onClose={closeModal}
            notification={activeNotification}
            orderId={activeNotification.orderId}
          />
        )}
      {modalType === 'warningModal' && warningModalProps && (
        <WarningModal
          isOpen={true}
          title={warningModalProps.title}
          message={warningModalProps.message}
          confirmButtonText={warningModalProps.confirmButtonText}
          cancelButtonText={warningModalProps.cancelButtonText}
          onConfirm={warningModalProps.onConfirm}
          onCancel={warningModalProps.onCancel}
        />
      )}
    </>
  );
};

export default ModalManagerComponent;
