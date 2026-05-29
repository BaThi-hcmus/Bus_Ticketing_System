import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './UserDetailModal.module.css';

const UserDetailModal = ({ isOpen, onClose, user }) => {
    if (!isOpen || !user) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết người dùng #{user.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>ID User</span>
                            <span className={styles.value}>{user.id}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {user.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Họ và tên</span>
                            <span className={styles.value} style={{ fontWeight: 600 }}>{user.fullName}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{user.email}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo</span>
                            <span className={styles.value}>{formatDate(user.createdAt)}</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Vai trò được gán</h3>
                    <div className={styles.rolesList}>
                        {(!user.roles || user.roles.length === 0) ? (
                            <div className={styles.noData}>Người dùng chưa được gán vai trò nào.</div>
                        ) : (
                            user.roles.map((role) => (
                                <div key={role.id} className={styles.roleItem}>
                                    <span className={styles.roleName}>{role.name}</span>
                                    <span className={`${styles.roleStatus} ${role.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                        {role.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;
