import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './RoleDetailModal.module.css';

const RoleDetailModal = ({ isOpen, onClose, role }) => {
    if (!isOpen || !role) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết vai trò #{role.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>ID Vai trò</span>
                            <span className={styles.value}>{role.id}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${role.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {role.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Tên vai trò</span>
                            <span className={styles.value} style={{ fontWeight: 600 }}>{role.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo</span>
                            <span className={styles.value}>{formatDate(role.createdAt)}</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Danh sách quyền được gán</h3>
                    <div className={styles.permsList}>
                        {(!role.permissions || role.permissions.length === 0) ? (
                            <div className={styles.noData}>Vai trò này chưa được gán quyền nào.</div>
                        ) : (
                            role.permissions.map((perm) => (
                                <div key={perm.id} className={styles.permItem}>
                                    <span className={styles.permName}>{perm.name}</span>
                                    <span className={`${styles.permStatus} ${perm.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                        {perm.status === 'active' ? 'Active' : 'Inactive'}
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

export default RoleDetailModal;
