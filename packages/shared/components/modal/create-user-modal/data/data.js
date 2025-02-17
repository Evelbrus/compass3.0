import { UserRole } from '@prisma/client';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { privateRoutes } from '@shared/utils/routing';
export const userCreationOptions = [
    {
        id: 'client',
        title: `${roleTranslations.Client}`,
        description: 'Заполните информацию, чтобы зарегистрировать нового клиента.',
        image: '/images/new-user.svg',
        buttonText: `Создать ${roleTranslations.Client}`,
        rolesAllowed: [UserRole.Admin, UserRole.Operator, UserRole.Driver],
        route: privateRoutes.USERCLIENTCREATE,
    },
    {
        id: 'clientCorp',
        title: `${roleTranslations.ClientCorp}`,
        description: 'Заполните информацию, чтобы зарегистрировать нового клиента.',
        image: '/images/new-user.svg',
        buttonText: `Создать ${roleTranslations.ClientCorp}`,
        rolesAllowed: [UserRole.Admin, UserRole.Operator, UserRole.Driver],
        route: privateRoutes.USERCLIENTCORPCREATE,
    },
    {
        id: 'driver',
        title: `${roleTranslations.Driver}`,
        description: 'Заполните информацию, чтобы зарегистрировать нового водителя.',
        image: '/images/new-user.svg',
        buttonText: `Создать ${roleTranslations.Driver}`,
        rolesAllowed: [UserRole.Admin, UserRole.Operator],
        route: privateRoutes.USERDRIVERCREATE,
    },
    {
        id: 'operator',
        title: `${roleTranslations.Operator}`,
        description: 'Только администраторы и операторы могут добавлять других операторов.',
        image: '/images/new-user.svg',
        buttonText: `Создать ${roleTranslations.Operator}`,
        rolesAllowed: [UserRole.Admin],
        route: privateRoutes.USEROPERATORCREATE,
    },
    {
        id: 'admin',
        title: `${roleTranslations.Admin}`,
        description: 'Только администраторы и операторы могут добавлять других администраторов.',
        image: '/images/new-user.svg',
        buttonText: `Создать ${roleTranslations.Admin}`,
        rolesAllowed: [UserRole.Admin, UserRole.Operator],
        route: privateRoutes.USERADMINCREATE,
    },
];
