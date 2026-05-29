import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import styles from './RoleModal.module.css';

const RoleModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
        permissions: []
    });
    
    const [allPermissions, setAllPermissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách tất cả permissions từ backend
    useEffect(() => {
        if (isOpen) {
            const fetchPermissions = async () => {
                try {
                    const response = await api.get('/admin/permission', {
                        params: { page: 1 }
                    });
                    // Lấy tất cả permissions (không phân trang)
                    setAllPermissions(response.data?.data || []);
                } catch (err) {
                    console.error('Lỗi khi tải danh sách quyền:', err);
                }
            };
            fetchPermissions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    status: initialData.status || 'active',
                    permissions: initialData.permissions 
                        ? initialData.permissions.map(p => p.id) 
                        : []
                });
            } else {
                setFormData({
                    name: '',
                    status: 'active',
                    permissions: []
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

    const handlePermissionToggle = (permId) => {
        setFormData(prev => {
            const current = prev.permissions;
            if (current.includes(permId)) {
                return { ...prev, permissions: current.filter(id => id !== permId) };
            } else {
                return { ...prev, permissions: [...current, permId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                permissions: formData.permissions,
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
                    <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label>Tên vai trò</label>
                            <input 
                                type="text" 
                                name="name"
                                className={styles.formControl}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: ADMIN, STAFF, DRIVER..."
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

                        <div className={styles.formGroup}>
                            <label>Gán quyền cho vai trò</label>
                            <div className={styles.permissionList}>
                                {allPermissions.length === 0 ? (
                                    <div className={styles.noPerms}>Chưa có quyền nào trong hệ thống.</div>
                                ) : (
                                    allPermissions.map(perm => (
                                        <label key={perm.id} className={styles.permissionItem}>
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionToggle(perm.id)}
                                            />
                                            <span className={styles.permName}>{perm.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
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

export default RoleModal;
