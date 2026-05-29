import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './PermissionDetailModal.module.css';

const PermissionDetailModal = ({ isOpen, onClose, permission }) => {
    if (!isOpen || !permission) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết quyền #{permission.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>ID Quyền</span>
                            <span className={styles.value}>{permission.id}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${permission.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {permission.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Tên quyền</span>
                            <span className={styles.value} style={{ fontFamily: 'monospace', fontWeight: 600 }}>{permission.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionDetailModal;
