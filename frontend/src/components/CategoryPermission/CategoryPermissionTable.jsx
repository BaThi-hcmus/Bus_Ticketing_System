import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './CategoryPermissionTable.module.css';

const CategoryPermissionTable = ({ categories, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên nhóm quyền</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.length === 0 ? (
                        <tr>
                            <td colSpan="4" className={styles.emptyState}>
                                Không tìm thấy danh mục nào.
                            </td>
                        </tr>
                    ) : (
                        categories.map((category, index) => (
                            <tr key={category.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{category.name}</td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${category.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(category)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {category.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(category.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(category)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(category.id)}
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

export default CategoryPermissionTable;
