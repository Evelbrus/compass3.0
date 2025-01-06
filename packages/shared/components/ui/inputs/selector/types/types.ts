import React from 'react';

export interface SelectorOption {
  value: string;
  label: string;
}

export interface SelectorProps {
  name: string;
  label: string;
  options: SelectorOption[];
  selectedValues: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  mode?: 'rows' | 'cells';
  status?: 'default' | 'invalid';
  isOpen: boolean;
  onToggle: () => void;
  onSelectionChange?: (value: string) => void;
}
