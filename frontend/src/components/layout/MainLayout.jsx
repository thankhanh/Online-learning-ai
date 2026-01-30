import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const MainLayout = ({ children, user, onLogout }) => {
    return (
        <div className="main-layout">
            <Navbar user={user} onLogout={onLogout} />
            <div className="layout-body">
                <Sidebar user={user} />
                <main className="layout-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
