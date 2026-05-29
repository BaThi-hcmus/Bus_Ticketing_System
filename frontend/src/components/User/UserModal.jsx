import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import styles from './UserModal.module.css';

const UserModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        status: 'active',
        roles: []
    });
    
    const [allRoles, setAllRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchRoles = async () => {
                try {
                    const response = await api.get('/admin/role/all');
                    setAllRoles(response.data || []);
                } catch (err) {
                    console.error('Lỗi khi tải danh sách vai trò:', err);
                }
            };
            fetchRoles();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    fullName: initialData.fullName || '',
                    email: initialData.email || '',
                    password: '', // Không hiển thị password cũ
                    status: initialData.status || 'active',
                    roles: initialData.roles 
                        ? initialData.roles.map(r => r.id) 
                        : []
                });
            } else {
                setFormData({
                    fullName: '',
                    email: '',
                    password: '',
                    status: 'active',
                    roles: []
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

    const handleRoleToggle = (roleId) => {
        setFormData(prev => {
            const current = prev.roles;
            if (current.includes(roleId)) {
                return { ...prev, roles: current.filter(id => id !== roleId) };
            } else {
                return { ...prev, roles: [...current, roleId] };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isEditMode && !formData.password) {
            alert('Vui lòng nhập mật khẩu cho người dùng mới');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                roles: formData.roles,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

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
                    <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label>Họ và tên</label>
                            <input 
                                type="text" 
                                name="fullName"
                                className={styles.formControl}
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Nhập họ và tên..."
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email</label>
                            <input 
                                type="email" 
                                name="email"
                                className={styles.formControl}
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ email..."
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Mật khẩu {isEditMode && <span className={styles.hint}>(Để trống nếu không muốn đổi)</span>}</label>
                            <input 
                                type="password" 
                                name="password"
                                className={styles.formControl}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Nhập mật khẩu..."
                                required={!isEditMode}
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
                            <label>Gán vai trò</label>
                            <div className={styles.roleList}>
                                {allRoles.length === 0 ? (
                                    <div className={styles.noRoles}>Chưa có vai trò nào trong hệ thống.</div>
                                ) : (
                                    allRoles.map(role => (
                                        <label key={role.id} className={styles.roleItem}>
                                            <input
                                                type="checkbox"
                                                checked={formData.roles.includes(role.id)}
                                                onChange={() => handleRoleToggle(role.id)}
                                            />
                                            <span className={styles.roleName}>{role.name}</span>
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

export default UserModal;
