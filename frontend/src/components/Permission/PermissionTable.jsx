import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './PermissionTable.module.css';

const PermissionTable = ({ permissions, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Mã quyền (Code)</th>
                        <th>Tên hiển thị</th>
                        <th>Nhóm quyền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {permissions.length === 0 ? (
                        <tr>
                            <td colSpan="6" className={styles.emptyState}>
                                Không tìm thấy quyền nào.
                            </td>
                        </tr>
                    ) : (
                        permissions.map((permission, index) => (
                            <tr key={permission.id}>
                                <td>{startIndex + index + 1}</td>
                                <td><code style={{background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '0.85em'}}>{permission.name}</code></td>
                                <td style={{ fontWeight: 600 }}>{permission.displayName || permission.name}</td>
                                <td>{permission.categoryPermission?.name || '—'}</td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${permission.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(permission)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {permission.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(permission.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(permission)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(permission.id)}
                                            title="Xóa"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PermissionTable;
