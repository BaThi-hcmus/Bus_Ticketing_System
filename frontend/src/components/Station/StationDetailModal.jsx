import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './StationDetailModal.module.css';

const StationDetailModal = ({ isOpen, onClose, station }) => {
    if (!isOpen || !station) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const formatCoord = (value) => {
        if (value == null || value === '') return 'Chưa cập nhật';
        return Number(value).toFixed(6);
    };

    const routeStations = station.routeStations || [];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết trạm dừng #{station.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Tên trạm</span>
                            <span className={styles.value}>{station.name}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${station.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {station.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem} style={{ gridColumn: '1 / -1' }}>
                            <span className={styles.label}>Địa chỉ</span>
                            <span className={styles.value}>{station.address}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Vĩ độ</span>
                            <span className={styles.value}>{formatCoord(station.lat)}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Kinh độ</span>
                            <span className={styles.value}>{formatCoord(station.lng)}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo</span>
                            <span className={styles.value}>{formatDate(station.createdAt)}</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Các tuyến đường có trạm này ({routeStations.length})</h3>
                    <div className={styles.routesList}>
                        {routeStations.length === 0 ? (
                            <div className={styles.noData}>Trạm dừng này chưa được gắn vào tuyến đường nào.</div>
                        ) : (
                            routeStations.map((rs) => (
                                <div key={rs.id} className={styles.routeItem}>
                                    <div>
                                        <strong>
                                            {rs.route
                                                ? `${rs.route.departureLocation} → ${rs.route.destinationLocation}`
                                                : `Tuyến #${rs.routeId}`}
                                        </strong>
                                    </div>
                                    <div>Thứ tự dừng: {rs.stopOrder}</div>
                                    {rs.distanceFromStart != null && (
                                        <div>Khoảng cách từ điểm xuất phát: {rs.distanceFromStart} km</div>
                                    )}
                                    {rs.route && (
                                        <div>Trạng thái tuyến: {rs.route.status}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StationDetailModal;
