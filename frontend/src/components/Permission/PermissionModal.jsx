import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './PermissionModal.module.css';

const PermissionModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        status: 'active'
    });
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    displayName: initialData.displayName || '',
                    status: initialData.status || 'active'
                });
            } else {
                setFormData({
                    name: '',
                    displayName: '',
                    status: 'active'
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                displayName: formData.displayName.trim()
            };
            if (isEditMode) {
                payload.status = formData.status;
            }
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label>Mã quyền (Code)</label>
                            <input 
                                type="text" 
                                name="name"
                                className={styles.formControl}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: user:create hoặc bus:view"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Tên hiển thị</label>
                            <input 
                                type="text" 
                                name="displayName"
                                className={styles.formControl}
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="VD: Tạo người dùng"
                                required
                            />
                        </div>

                        {isEditMode && (
                            <div className={styles.formGroup}>
                                <label>Trạng thái</label>
                                <select 
                                    name="status"
                                    className={styles.formControl}
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Dừng hoạt động</option>
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div className={styles.footer}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionModal;
