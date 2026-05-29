import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './RoleTable.module.css';

const RoleTable = ({ roles, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên vai trò</th>
                        <th>Số quyền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {roles.length === 0 ? (
                        <tr>
                            <td colSpan="5" className={styles.emptyState}>
                                Không tìm thấy vai trò nào.
                            </td>
                        </tr>
                    ) : (
                        roles.map((role, index) => (
                            <tr key={role.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{role.name}</td>
                                <td>
                                    <span className={styles.permCount}>
                                        {role.permissions ? role.permissions.length : 0} quyền
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${role.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(role)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {role.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(role.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(role)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(role.id)}
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

export default RoleTable;
