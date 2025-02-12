export interface CurrencyInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export interface CurrencyOption {
  code: string;
  name: string;
}
