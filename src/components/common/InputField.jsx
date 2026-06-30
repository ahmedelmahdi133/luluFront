import React from 'react';

const InputField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    required = false,
    options = [], // For select type
    placeholder = '',
    className = '',
    style = {},
    wrapperStyle = {},
    wrapperClassName = '',
    ...props
}) => {
    const inputClasses = "w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border-[1.5px] border-slate-200 rounded-md outline-none transition-all hover:border-slate-300 focus:border-indigo-600 focus:ring-[3px] focus:ring-indigo-600/15";

    let inputElement;

    if (type === 'select') {
        inputElement = (
            <select
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className={`${inputClasses} ${className}`}
                style={style}
                {...props}
            >
                {options.map((opt, index) => (
                    <option key={index} value={opt.value !== undefined ? opt.value : opt.id || opt._id}>
                        {opt.label || opt.name}
                    </option>
                ))}
            </select>
        );
    } else if (type === 'textarea') {
        inputElement = (
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`${inputClasses} ${className}`}
                style={style}
                {...props}
            />
        );
    } else {
        inputElement = (
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                placeholder={placeholder}
                className={`${inputClasses} ${className}`}
                style={style}
                {...props}
            />
        );
    }

    if (!label) {
        return inputElement;
    }

    return (
        <div className={`flex flex-col gap-1 w-full ${wrapperClassName}`} style={wrapperStyle}>
            <label className="text-sm font-semibold text-slate-600 tracking-[0.01em]">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {inputElement}
        </div>
    );
};

export default InputField;
