import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './BusDetailModal.module.css';

const BusDetailModal = ({ isOpen, onClose, bus }) => {
    if (!isOpen || !bus) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Chi tiết xe bus #{bus.id}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.body}>
                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Biển số xe</span>
                            <span className={styles.value}>{bus.licensePlate}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Trạng thái</span>
                            <span className={`${styles.statusBadge} ${bus.status === 'active' ? styles.statusActive : styles.statusInactive}`}>
                                {bus.status === 'active' ? 'Hoạt động' : 'Dừng hoạt động'}
                            </span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Loại xe</span>
                            <span className={styles.value}>{bus.type}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Hãng xe</span>
                            <span className={styles.value}>{bus.model}</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Số ghế</span>
                            <span className={styles.value}>{bus.totalSeats} ghế</span>
                        </div>
                        <div className={styles.infoItem}>
                            <span className={styles.label}>Ngày tạo</span>
                            <span className={styles.value}>{formatDate(bus.createdAt)}</span>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Các chuyến xe đang chạy</h3>
                    <div className={styles.tripsList}>
                        {(!bus.trips || bus.trips.length === 0) ? (
                            <div className={styles.noData}>Xe bus này chưa được xếp chuyến nào.</div>
                        ) : (
                            bus.trips.map((trip) => (
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

export default BusDetailModal;
