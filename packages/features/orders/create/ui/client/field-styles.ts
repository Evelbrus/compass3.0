// Тип для стилей полей
export type FieldStyle = {
  bgColor: string;
  textGradient: string;
  borderColor: string;
  shadowColor: string;
  textColor: string;
  icon: string;
  name: string;
};

export const FIELD_STYLES = {
  client: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-700 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'C',
    name: 'Клиент (выбор из базы)',
  },
  email: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-700 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'E',
    name: 'Email пользователя',
  },
  phone: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Т',
    name: 'Телефон клиента',
  },
  fullName: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Ф',
    name: 'ФИО клиента',
  },
  companyName: {
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    textGradient: 'bg-gradient-to-r from-blue-700 to-indigo-700',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-100',
    textColor: 'text-white',
    icon: 'К',
    name: 'Название компании',
  },
  companyPhone: {
    bgColor: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    textGradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    borderColor: 'border-blue-200',
    shadowColor: 'shadow-blue-100',
    textColor: 'text-white',
    icon: 'Т',
    name: 'Телефон компании',
  },
  flight: {
    bgColor: '',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: '✈️',
    name: 'Номер рейса',
  },
  description: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'О',
    name: 'Описание',
  },
  logo: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Л',
    name: 'Логотип компании',
  },
  hours: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'Ч',
    name: 'Часы',
  },
  minutes: {
    bgColor: 'bg-gradient-to-r from-cyan-500 to-blue-500',
    textGradient: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    borderColor: 'border-cyan-200',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'М',
    name: 'Минуты',
  },
} as const;
