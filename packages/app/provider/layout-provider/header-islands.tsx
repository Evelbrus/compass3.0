'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@features/auth/lib/use-auth';
import { CustomUser } from '@shared/lib/api/authOptions';

//Динамические острова
const ProfileIsland = dynamic(() => import('@widgets/profile-island/profile-island'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
});

const NotificationIsland = dynamic(
  () => import('@widgets/notification-island/notification-island'),
  {
    ssr: false,
    loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
  },
);

const HeaderIslands = ({ userProfile }: { userProfile: CustomUser }) => {
  const { logout } = useAuth();

  return (
    <div className={'w-full flex flex-row justify-between'}>
      <ProfileIsland userProfile={userProfile} onLogout={logout} />
      <NotificationIsland userId={userProfile} />
    </div>
  );
};

export default HeaderIslands;
