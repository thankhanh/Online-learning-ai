import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5 } : {}}
            className={`card bg-dark text-white border-secondary shadow-sm ${className}`}
            {...props}
        >
            <div className="card-body">
                {children}
            </div>
        </motion.div>
    );
};

export default Card;
