import React from 'react';

const VARIANTS = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    ghost: 'btn-ghost',
    outline: 'btn-outline',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base rounded-lg',
    icon: 'p-1.5 rounded-sm'
};

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconSize = 13,
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-md border-none cursor-pointer transition-all leading-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = VARIANTS[variant] || VARIANTS.primary;
    const sizeClasses = SIZES[size] || SIZES.md;
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`}
            {...props}
        >
            {Icon && <Icon size={iconSize} />}
            {children && <span>{children}</span>}
        </button>
    );
};

export default Button;
