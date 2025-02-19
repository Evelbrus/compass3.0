'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { UserRole } from '@prisma/client';
import AdminDetailView from '@pages/(administrator)/(users)/user/admin/AdminDetailView';
import ClientCorpDetailView from '@pages/(administrator)/(users)/user/client-corp/ClientCorpDetailView';
import DriverDetailView from '@pages/(administrator)/(users)/user/driver/DriverDetailView';
import OperatorDetailView from '@pages/(administrator)/(users)/user/operator/OperatorDetailView';
import ClientDetailView from '@pages/(administrator)/(users)/user/client/ClientDetailView';
const ClientsDetailAdminPage = ({ userData }) => {
    const role = userData.role;
    switch (role) {
        case UserRole.Client:
            return _jsx(ClientDetailView, { userData: userData });
        case UserRole.ClientCorp:
            return _jsx(ClientCorpDetailView, { userData: userData });
        case UserRole.Driver:
            return _jsx(DriverDetailView, { userData: userData });
        case UserRole.Operator:
            return _jsx(OperatorDetailView, { userData: userData });
        case UserRole.Admin:
            return _jsx(AdminDetailView, { userData: userData });
        default:
            return _jsx(ClientDetailView, { userData: userData });
    }
};
export default ClientsDetailAdminPage;
