import { showToast } from '@shared/components/toast/ToastManager';

export const handleDownload = (uuid: string | undefined) => {
  if (!uuid) {
    showToast.error('Ошибка: отсутствует идентификатор пользователя!');
    return;
  }

  showToast.info('Функционал в разработке. Ожидайте обновлений!', { autoClose: 3000 });
};
