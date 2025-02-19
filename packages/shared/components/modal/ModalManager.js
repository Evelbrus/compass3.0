'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
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
const ModalManagerComponent = ({ role }) => {
    const modalType = useUnit($modalType);
    return (_jsxs(_Fragment, { children: [modalType === 'createUserModal' &&
                (role === UserRole.Admin || role === UserRole.Operator) && (_jsx(CreateUserModal, { role: role, onClose: closeModal })), modalType === 'orderDetailDriver' && _jsx(OrderDetailDriverModal, {}), modalType === 'deleteModal' && (role === UserRole.Operator || role === UserRole.Admin) && (_jsx(DeleteModal, { onClose: closeModal })), modalType === 'createClientCorpOrder' && role === UserRole.ClientCorp && (_jsx(CreateClientCorpOrder, { onClose: closeModal })), modalType === 'changePasswordModal' && _jsx(ChangePasswordModal, { onClose: closeModal }), modalType === 'createAdditionalServiceModal' &&
                (role === UserRole.Operator || role === UserRole.Admin) && (_jsx(CreateAdditionalServiceModal, { onClose: closeModal })), modalType === 'createPointModal' &&
                (role === UserRole.Operator || role === UserRole.Admin) && (_jsx(CreatePointModal, { onClose: closeModal }))] }));
};
export default ModalManagerComponent;
