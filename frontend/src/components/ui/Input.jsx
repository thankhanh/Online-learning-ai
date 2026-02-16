import React from 'react';

const Input = ({ className = '', ...props }) => {
    return (
        <input
            className={`form-control bg-dark text-white border-secondary ${className}`}
            {...props}
        />
    );
};

export default Input;
