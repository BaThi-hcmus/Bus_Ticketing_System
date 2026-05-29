import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './UserTable.module.css';

const UserTable = ({ users, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Vai trò</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6" className={styles.emptyState}>
                                Không tìm thấy người dùng nào.
                            </td>
                        </tr>
                    ) : (
                        users.map((user, index) => (
                            <tr key={user.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{user.fullName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className={styles.roleList}>
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map(r => (
                                                <span key={r.id} className={styles.roleBadge}>{r.name}</span>
                                            ))
                                        ) : (
                                            <span className={styles.noRole}>Chưa có</span>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${user.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(user)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {user.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(user.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(user)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(user.id)}
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

export default UserTable;
