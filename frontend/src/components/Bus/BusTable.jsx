import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './BusTable.module.css';

const BusTable = ({ buses, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Biển số xe</th>
                        <th>Loại xe</th>
                        <th>Hãng xe</th>
                        <th>Số ghế</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {buses.length === 0 ? (
                        <tr>
                            <td colSpan="7" className={styles.emptyState}>
                                Không tìm thấy xe bus nào.
                            </td>
                        </tr>
                    ) : (
                        buses.map((bus, index) => (
                            <tr key={bus.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{bus.licensePlate}</td>
                                <td>{bus.type}</td>
                                <td>{bus.model}</td>
                                <td>{bus.totalSeats}</td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${bus.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(bus)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {bus.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(bus.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(bus)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(bus.id)}
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

export default BusTable;
