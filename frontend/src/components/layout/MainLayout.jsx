import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user, onLogout, unreadCount }) => {
    return (
        <div className="d-flex flex-column vh-100">
            <Navbar user={user} onLogout={onLogout} unreadCount={unreadCount} />
            <div className="d-flex flex-grow-1 overflow-hidden">
                <Sidebar user={user} unreadCount={unreadCount} />
                <main className="flex-grow-1 p-3 overflow-auto bg-dark text-white">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
