import { showToast } from '@shared/components/toast/ToastManager';
export const handleDownload = (uuid) => {
    if (!uuid) {
        showToast.error('Ошибка: отсутствует идентификатор пользователя!');
        return;
    }
    showToast.info('Функционал в разработке. Ожидайте обновлений!', { autoClose: 3000 });
    fetch(`/api/users/${uuid}`)
        .then((response) => response.json())
        .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user_${uuid}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast.success('Файл успешно скачан!');
    })
        .catch((error) => {
        console.error('Ошибка при скачивании данных:', error);
        showToast.error('Ошибка при скачивании данных. Попробуйте позже.');
    });
};
