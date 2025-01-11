import { UserRole } from '@prisma/client';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { privateRoutes } from '@shared/utils/routing';

export interface ModalUserCreate {
  id: string;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  rolesAllowed: UserRole[];
  route: string;
}

export const userCreationOptions: ModalUserCreate[] = [
  {
    id: 'client',
    title: `Создать ${roleTranslations.Client}`,
    description: 'Заполните информацию, чтобы зарегистрировать нового клиента.',
    image: '/images/client-icon.png',
    buttonText: `Создать ${roleTranslations.Client}`,
    rolesAllowed: [UserRole.Admin, UserRole.Operator, UserRole.Driver],
    route: privateRoutes.USERCLIENTCREATE,
  },
  {
    id: 'clientCorp',
    title: `Создать ${roleTranslations.ClientCorp}`,
    description: 'Заполните информацию, чтобы зарегистрировать нового клиента.',
    image: '/images/client-icon.png',
    buttonText: `Создать ${roleTranslations.ClientCorp}`,
    rolesAllowed: [UserRole.Admin, UserRole.Operator, UserRole.Driver],
    route: privateRoutes.USERCLIENTCORPCREATE,
  },
  {
    id: 'driver',
    title: `Создать ${roleTranslations.Driver}`,
    description: 'Заполните информацию, чтобы зарегистрировать нового водителя.',
    image: '/images/drivers-icon.png',
    buttonText: `Создать ${roleTranslations.Driver}`,
    rolesAllowed: [UserRole.Admin, UserRole.Operator],
    route: privateRoutes.USERDRIVERCREATE,
  },
  {
    id: 'operator',
    title: `Создать ${roleTranslations.Operator}`,
    description: 'Только администраторы и операторы могут добавлять других операторов.',
    image: '/images/operator-icon.png',
    buttonText: `Создать ${roleTranslations.Operator}`,
    rolesAllowed: [UserRole.Admin],
    route: privateRoutes.USEROPERATORCREATE,
  },
  {
    id: 'admin',
    title: `Создать ${roleTranslations.Admin}`,
    description: 'Только администраторы и операторы могут добавлять других администраторов.',
    image: '/images/admin-icon.png',
    buttonText: `Создать ${roleTranslations.Admin}`,
    rolesAllowed: [UserRole.Admin, UserRole.Operator],
    route: privateRoutes.USERADMINCREATE,
  },
];
