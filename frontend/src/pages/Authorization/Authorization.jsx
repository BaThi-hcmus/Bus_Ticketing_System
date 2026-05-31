import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Authorization.module.css';
import { FaSave, FaSync } from 'react-icons/fa';

const Authorization = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    
    // Matrix: { [roleId]: { [permissionId]: boolean } }
    const [matrix, setMatrix] = useState({});
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/admin/role/all'),
                api.get('/admin/permission/all')
            ]);
            
            const fetchedRoles = rolesRes.data || [];
            const fetchedPerms = permsRes.data || [];
            
            setRoles(fetchedRoles);
            setPermissions(fetchedPerms);

            // Xây dựng ma trận ban đầu
            const initialMatrix = {};
            fetchedRoles.forEach(role => {
                initialMatrix[role.id] = {};
                // Mặc định tất cả là false
                fetchedPerms.forEach(perm => {
                    initialMatrix[role.id][perm.id] = false;
                });
                
                // Cập nhật true cho những quyền role đang có
                if (role.permissions && role.permissions.length > 0) {
                    role.permissions.forEach(perm => {
                        initialMatrix[role.id][perm.id] = true;
                    });
                }
            });
            
            setMatrix(initialMatrix);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu phân quyền:', error);
            setMessage({ type: 'error', text: 'Lấy dữ liệu thất bại. Vui lòng thử lại.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCheckboxChange = (roleId, permId) => {
        setMatrix(prev => ({
            ...prev,
            [roleId]: {
                ...prev[roleId],
                [permId]: !prev[roleId][permId]
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            // Gom nhóm request cho từng Role
            const updatePromises = roles.map(role => {
                // Lọc ra danh sách các permissionId đang có giá trị true cho role này
                const activePermissions = Object.keys(matrix[role.id])
                    .filter(permId => matrix[role.id][permId])
                    .map(id => parseInt(id, 10));

                return api.patch(`/admin/role/edit/${role.id}`, {
                    permissions: activePermissions
                });
            });

            await Promise.all(updatePromises);
            
            setMessage({ type: 'success', text: 'Lưu thay đổi phân quyền thành công!' });
            
            // Xóa thông báo sau 3s
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Lỗi khi lưu phân quyền:', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu thay đổi!' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Đang tải dữ liệu phân quyền...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Phân quyền hệ thống (Matrix)</h1>
                <div className={styles.actions}>
                    <button 
                        className={`${styles.btn} ${styles.btnRefresh}`}
                        onClick={fetchData}
                        disabled={saving}
                    >
                        <FaSync /> Làm mới
                    </button>
                    <button 
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <FaSave /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.tableContainer}>
                <table className={styles.matrixTable}>
                    <thead>
                        <tr>
                            <th className={styles.stickyCol}>Quyền (Permissions)</th>
                            {roles.map(role => (
                                <th key={role.id} className={styles.roleHeader}>
                                    <div className={styles.roleName}>{role.name}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {permissions.length === 0 ? (
                            <tr>
                                <td colSpan={roles.length + 1} className={styles.emptyMsg}>
                                    Chưa có dữ liệu Permission
                                </td>
                            </tr>
                        ) : (
                            permissions.map(perm => (
                                <tr key={perm.id}>
                                    <td className={styles.stickyCol}>
                                        <div className={styles.permName}>{perm.displayName || perm.name}</div>
                                    </td>
                                    {roles.map(role => (
                                        <td key={role.id} className={styles.checkboxCell}>
                                            <input
                                                type="checkbox"
                                                className={styles.matrixCheckbox}
                                                checked={matrix[role.id]?.[perm.id] || false}
                                                onChange={() => handleCheckboxChange(role.id, perm.id)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Authorization;
