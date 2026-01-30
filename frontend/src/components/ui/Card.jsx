import React from 'react';
import { twMerge } from 'tailwind-merge';
import { motion } from 'framer-motion';

const Card = ({ children, className, hover = true, ...props }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5 } : {}}
            className={twMerge(
                "glass-panel p-6 border border-white/5 bg-white/5 backdrop-blur-md rounded-xl transition-colors hover:border-primary/50",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default Card;
