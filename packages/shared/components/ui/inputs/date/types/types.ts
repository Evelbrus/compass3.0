export interface DateInputProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  classNameLabel?: string;
  classNameInput?: string;
  minDate?: Date;
  lang?: string;
  errorBorder?: boolean;
  error?: boolean;
  message?: string;
  required?: boolean;
  requiredStar?: boolean;
  maxDate?: Date;
}
