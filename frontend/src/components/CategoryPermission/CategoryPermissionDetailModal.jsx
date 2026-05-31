import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './CategoryPermissionDetailModal.module.css';

const CategoryPermissionDetailModal = ({ isOpen, onClose, category }) => {
    if (!isOpen || !category) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết danh mục #{category.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>ID Danh mục</span>
                            <span className={styles.value}>{category.id}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${category.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {category.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Tên danh mục</span>
                            <span className={styles.value} style={{ fontWeight: 600 }}>{category.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo</span>
                            <span className={styles.value}>{new Date(category.createdAt).toLocaleString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryPermissionDetailModal;
