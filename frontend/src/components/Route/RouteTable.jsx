import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './RouteTable.module.css';

const RouteTable = ({ routes, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Điểm đi</th>
                        <th>Điểm đến</th>
                        <th>Khoảng cách (km)</th>
                        <th>Thời gian (phút)</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {routes.length === 0 ? (
                        <tr>
                            <td colSpan="7" className={styles.emptyState}>
                                Không tìm thấy tuyến đường nào.
                            </td>
                        </tr>
                    ) : (
                        routes.map((route, index) => (
                            <tr key={route.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{route.departureLocation}</td>
                                <td>{route.destinationLocation}</td>
                                <td>{route.distanceKm} km</td>
                                <td>{route.estimatedDuration} phút</td>
                                <td>
                                    <button 
                                        className={`${styles.statusBadge} ${route.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(route)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {route.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(route.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(route)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button 
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(route.id)}
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

export default RouteTable;
