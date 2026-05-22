import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './StationModal.module.css';

const StationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: '',
        lng: '',
        status: 'active',
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    name: initialData.name || '',
                    address: initialData.address || '',
                    lat: initialData.lat ?? '',
                    lng: initialData.lng ?? '',
                    status: initialData.status || 'active',
                });
            } else {
                setFormData({
                    name: '',
                    address: '',
                    lat: '',
                    lng: '',
                    status: 'active',
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                status: formData.status,
            };

            if (formData.lat !== '' && formData.lat != null) {
                payload.lat = Number(formData.lat);
            }
            if (formData.lng !== '' && formData.lng != null) {
                payload.lng = Number(formData.lng);
            }

            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa trạm dừng' : 'Thêm trạm dừng mới'}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label>Tên trạm / bến xe</label>
                            <input
                                type="text"
                                name="name"
                                className={styles.formControl}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: Bến xe Miền Đông"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                className={styles.formControl}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="VD: Bình Thạnh, TP.HCM"
                                required
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Vĩ độ (lat)</label>
                                <input
                                    type="number"
                                    name="lat"
                                    step="any"
                                    className={styles.formControl}
                                    value={formData.lat}
                                    onChange={handleChange}
                                    placeholder="VD: 10.814324"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Kinh độ (lng)</label>
                                <input
                                    type="number"
                                    name="lng"
                                    step="any"
                                    className={styles.formControl}
                                    value={formData.lng}
                                    onChange={handleChange}
                                    placeholder="VD: 106.711804"
                                />
                            </div>
                        </div>

                        {isEditMode && (
                            <div className={styles.formGroup}>
                                <label>Trạng thái</label>
                                <select
                                    name="status"
                                    className={styles.formControl}
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Dừng hoạt động</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`} disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StationModal;
