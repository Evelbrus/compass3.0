// handleFinish.ts
'use client';

/**
 * Функция для завершения формы с опциональной проверкой перед отправкой
 * @param checkCondition функция-предикат, проверяющая условие перед отправкой формы
 * @param onSubmit функция для отправки формы
 * @param onShowWarning функция для показа предупреждения, если условие не выполнено
 */
export const handleFinish = (
  checkCondition: () => boolean,
  onSubmit: () => void,
  onShowWarning?: () => void,
) => {
  if (!checkCondition()) {
    // Если условие не выполнено и есть функция для показа предупреждения, вызываем её
    if (onShowWarning) {
      onShowWarning();
    }
  } else {
    // Если условие выполнено, отправляем форму
    onSubmit();
  }
};

export default handleFinish;
