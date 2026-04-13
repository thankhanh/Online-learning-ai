import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children, user, onLogout, unreadCount }) => {
    return (
        <div className="d-flex flex-column vh-100 bg-main">
            <Navbar user={user} onLogout={onLogout} unreadCount={unreadCount} />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <Sidebar user={user} unreadCount={unreadCount} />
                <main className="flex-grow-1 p-0 overflow-hidden d-flex flex-column">
                    <div className="flex-grow-1 p-4 overflow-auto custom-scrollbar ">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={window.location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="h-100"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
