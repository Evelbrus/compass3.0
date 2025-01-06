export const handleDownload = (uuid: string, navigate: (path: string) => void) => {
  // Реализуйте логику скачивания по uuid
  // Например, скачивание профиля пользователя или других данных
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
    })
    .catch((error) => {
      // Обработка ошибок
      console.error('Ошибка при скачивании данных:', error);
    });
};
