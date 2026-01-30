import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = ({ className, ...props }) => {
    return (
        <input
            className={twMerge(
                "w-full px-4 py-3 bg-dark-surface border border-dark-border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all",
                className
            )}
            {...props}
        />
    );
};

export default Input;
