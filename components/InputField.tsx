
import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode; // Optional icon element
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  className = '',
  icon,
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-sky-300 mb-1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={id}
          className={`block w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ${icon ? 'pl-10' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};
