
import React from 'react';

interface TextAreaFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  disabled = false,
  required = false,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-sky-300 mb-1">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className="block w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
      />
    </div>
  );
};
