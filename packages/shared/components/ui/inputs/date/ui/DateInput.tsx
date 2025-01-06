import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { enUS, ru } from 'date-fns/locale';
import { DateInputProps } from '@shared/components/ui/inputs/date';
import { getLanguageCode } from '@shared/utils/language';
import { cn } from '@shared/lib';

export const DateInput: React.FC<DateInputProps & { showTime?: boolean }> = ({
  selectedDate,
  onChange,
  label,
  placeholder = 'Выберите дату',
  className = '',
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  classNameInput = 'font-extrabold w-full bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200',
  lang = 'ru-RU',
  errorBorder = false,
  showTime = false,
  error = false,
  message = '',
  required = false,
  requiredStar = false,
  maxDate,
}) => {
  const languageCode = getLanguageCode(lang);
  const locale = languageCode === 'ru' ? ru : enUS;
  registerLocale(languageCode, locale);

  return (
    <div className={`relative ${cn(className)} ${errorBorder ? 'border-2 border-red-400' : ''}`}>
      {label && (
        <label
          className={`${classNameLabel}`}
          htmlFor={`date-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {label}
          {requiredStar && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        id={`date-input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'date-input'}`}
        selected={selectedDate}
        onChange={(date) => onChange(date || null)}
        placeholderText={placeholder}
        className={`${classNameInput} ${error ? 'border-red-500' : ''}`}
        dateFormat={showTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd'}
        locale={languageCode}
        showTimeSelect={showTime}
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Время"
        onKeyDown={(e) => e.preventDefault()}
        required={required}
        aria-invalid={error}
        maxDate={maxDate}
      />
      {error && message && <p className="text-red-500 text-sm mt-1">{message}</p>}
    </div>
  );
};

DateInput.displayName = 'DateInput';
