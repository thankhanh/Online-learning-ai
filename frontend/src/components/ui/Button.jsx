import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "btn";

    const variants = {
        primary: "btn-primary",
        secondary: "btn-secondary",
        alert: "btn-danger",
        ghost: "btn-outline-light",
    };

    const variantClass = variants[variant] || variants.primary;

    return (
        <button
            className={`${baseStyles} ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
