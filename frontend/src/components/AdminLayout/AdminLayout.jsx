import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaBus, FaRoute, FaUsers, FaTicketAlt } from 'react-icons/fa';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    Bus Admin
                </div>
                <nav className={styles.nav}>
                    <NavLink 
                        to="/admin/buses" 
                        className={({isActive}) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
                    >
                        <FaBus /> Quản lý Xe Bus
                    </NavLink>
                    {/* Placeholder for future routes */}
                    <div className={styles.navItem} style={{opacity: 0.5, cursor: 'not-allowed'}}>
                        <FaRoute /> Quản lý Tuyến đường
                    </div>
                    <div className={styles.navItem} style={{opacity: 0.5, cursor: 'not-allowed'}}>
                        <FaUsers /> Quản lý Khách hàng
                    </div>
                    <div className={styles.navItem} style={{opacity: 0.5, cursor: 'not-allowed'}}>
                        <FaTicketAlt /> Quản lý Vé
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className={styles.main}>
                <header className={styles.header}>
                    <div className={styles.userProfile}>
                        <span>Admin User</span>
                        <div className={styles.avatar}>A</div>
                    </div>
                </header>
                
                <main className={styles.content}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
