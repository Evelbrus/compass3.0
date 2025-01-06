export interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
}

export interface CurrencyOption {
  code: string;
  name: string;
}
