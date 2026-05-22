import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import styles from './StationTable.module.css';

const StationTable = ({ stations, startIndex = 0, onEdit, onDelete, onToggleStatus, onView }) => {
    const formatCoord = (value) => {
        if (value == null || value === '') return '—';
        return Number(value).toFixed(5);
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Tên trạm</th>
                        <th>Địa chỉ</th>
                        <th>Vĩ độ</th>
                        <th>Kinh độ</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {stations.length === 0 ? (
                        <tr>
                            <td colSpan="7" className={styles.emptyState}>
                                Không tìm thấy trạm dừng nào.
                            </td>
                        </tr>
                    ) : (
                        stations.map((station, index) => (
                            <tr key={station.id}>
                                <td>{startIndex + index + 1}</td>
                                <td style={{ fontWeight: 600 }}>{station.name}</td>
                                <td>{station.address}</td>
                                <td>{formatCoord(station.lat)}</td>
                                <td>{formatCoord(station.lng)}</td>
                                <td>
                                    <button
                                        className={`${styles.statusBadge} ${station.status === 'active' ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => onToggleStatus(station)}
                                        title="Nhấn để đổi trạng thái"
                                    >
                                        {station.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className={`${styles.actionBtn} ${styles.viewBtn}`}
                                            onClick={() => onView(station.id)}
                                            title="Xem chi tiết"
                                        >
                                            <FaEye size={16} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(station)}
                                            title="Chỉnh sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(station.id)}
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

export default StationTable;
