import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './RouteDetailModal.module.css';

const RouteDetailModal = ({ isOpen, onClose, route }) => {
    if (!isOpen || !route) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết Tuyến đường #{route.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Điểm đi</span>
                            <span className={styles.value}>{route.departureLocation}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Điểm đến</span>
                            <span className={styles.value}>{route.destinationLocation}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${route.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {route.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Khoảng cách</span>
                            <span className={styles.value}>{route.distanceKm} km</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Lộ trình các trạm dừng</h3>
                    <div className={styles.tripsList} style={{ maxHeight: '200px' }}>
                        {(!route.routeStations || route.routeStations.length === 0) ? (
                            <div className={styles.noData}>Tuyến đường này chưa cấu hình trạm dừng.</div>
                        ) : (
                            route.routeStations.map((rs) => (
                                <div key={rs.id} className={styles.tripItem} style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '40px', fontWeight: 'bold', color: '#3b82f6', fontSize: '1.2em' }}>
                                        #{rs.stopOrder}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <strong style={{ fontSize: '1.1em' }}>{rs.station?.name || 'Trạm ẩn'}</strong>
                                        <div style={{ color: '#64748b', fontSize: '0.9em' }}>{rs.station?.address || ''}</div>
                                    </div>
                                    <div style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                        {rs.distanceFromStart} km
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <h3 className={styles.sectionTitle} style={{ marginTop: '20px' }}>Các chuyến xe chạy trên tuyến này</h3>
                    <div className={styles.tripsList} style={{ maxHeight: '200px' }}>
                        {(!route.trips || route.trips.length === 0) ? (
                            <div className={styles.noData}>Tuyến đường này chưa có chuyến xe nào được tạo.</div>
                        ) : (
                            route.trips.map((trip) => (
                                <div key={trip.id} className={styles.tripItem}>
                                    <div><strong>Chuyến #{trip.id}</strong> - Giá vé: {trip.ticketPrice} VND</div>
                                    <div>Khởi hành: {formatDate(trip.departureTime)}</div>
                                    <div>Đến nơi: {formatDate(trip.arrivalTime)}</div>
                                    <div>Trạng thái chuyến: {trip.status}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteDetailModal;
