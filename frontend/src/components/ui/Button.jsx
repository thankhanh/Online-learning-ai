import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-primary hover:bg-primary-dark text-white focus:ring-primary",
        secondary: "bg-secondary hover:bg-secondary-dark text-white focus:ring-secondary",
        alert: "bg-alert hover:bg-alert-dark text-white focus:ring-alert",
        ghost: "bg-transparent hover:bg-white/10 text-slate-300",
    };

    return (
        <button
            className={twMerge(baseStyles, variants[variant], className)}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
