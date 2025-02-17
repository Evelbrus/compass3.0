'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import styles from './Checkbox.module.css';
export const Checkbox = ({ id, label, checked, onChange, required, disabled, loading = false, error, tabIndex = 0, }) => {
    return (_jsx("div", { className: "flex flex-col space-y-1 items-start", children: _jsxs("div", { className: `${styles.formGroupCheckbox}`, children: [_jsx("input", { type: "checkbox", id: id, checked: checked, onChange: onChange, required: required, disabled: disabled || loading, className: `${styles.checkboxInput} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`, tabIndex: tabIndex }), _jsx("label", { htmlFor: id, className: `${styles.labelText} text-gray-600 cursor-pointer`, children: label })] }) }));
};
Checkbox.displayName = 'Checkbox';
