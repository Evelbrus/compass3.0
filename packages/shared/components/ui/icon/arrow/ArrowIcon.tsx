// ArrowIcon.tsx
import React, { FC } from 'react';

interface ArrowIconProps extends React.SVGProps<SVGSVGElement> {
  open?: boolean; // Для поворота при открытии/закрытии селектора
  isFilter?: boolean; // Для поворота вправо
  direction?: 'asc' | 'desc'; // Свойство для направления сортировки
}

const ArrowIcon: FC<ArrowIconProps> = ({
  open = false,
  isFilter = false,
  direction = 'desc', // По умолчанию вниз
  ...props
}) => {
  let rotation = 'rotate(0deg)'; // По умолчанию вниз

  if (isFilter) {
    rotation = 'rotate(-90deg)'; // Поворот вправо для фильтра
  } else if (open) {
    rotation = 'rotate(180deg)'; // Поворот вверх при открытии селектора
  } else {
    if (direction === 'asc') {
      rotation = 'rotate(180deg)'; // Поворот вверх
    } else if (direction === 'desc') {
      rotation = 'rotate(0deg)'; // Поворот вниз
    }
  }

  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        transform: rotation,
        transition: 'transform 0.3s ease', // Увеличил время анимации для более плавного эффекта
      }}
      {...props}
    >
      <path
        d="M1 1L5 5L9 1"
        stroke="#4B5563"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ArrowIcon;
