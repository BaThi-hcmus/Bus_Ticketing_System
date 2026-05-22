import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './BusModal.module.css';

const BusModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;
    
    const [formData, setFormData] = useState({
        licensePlate: '',
        type: 'Giường nằm', // Default
        totalSeats: 40,
        model: '',
        status: 'active'
    });
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    licensePlate: initialData.licensePlate || '',
                    type: initialData.type || 'Giường nằm',
                    totalSeats: initialData.totalSeats || 40,
                    model: initialData.model || '',
                    status: initialData.status || 'active'
                });
            } else {
                setFormData({
                    licensePlate: '',
                    type: 'Giường nằm',
                    totalSeats: 40,
                    model: '',
                    status: 'active'
                });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'totalSeats' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                licensePlate: formData.licensePlate.trim(),
                type: formData.type,
                totalSeats: Number(formData.totalSeats),
                model: formData.model.trim(),
            };
            if (isEditMode) {
                payload.status = formData.status;
            }
            await onSubmit(payload);
            onClose();
        } catch (error) {
            // Error is handled in the parent component
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{isEditMode ? 'Chỉnh sửa xe bus' : 'Thêm xe bus mới'}</h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label>Biển số xe</label>
                            <input 
                                type="text" 
                                name="licensePlate"
                                className={styles.formControl}
                                value={formData.licensePlate}
                                onChange={handleChange}
                                placeholder="VD: 29A-123.45"
                                required
                            />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label>Hãng xe / Dòng xe</label>
                            <input 
                                type="text" 
                                name="model"
                                className={styles.formControl}
                                value={formData.model}
                                onChange={handleChange}
                                placeholder="VD: Hyundai Universe"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Loại xe</label>
                            <select 
                                name="type"
                                className={styles.formControl}
                                value={formData.type}
                                onChange={handleChange}
                            >
                                <option value="Giường nằm">Giường nằm</option>
                                <option value="Ghế ngồi">Ghế ngồi</option>
                                <option value="Limousine">Limousine</option>
                                <option value="Giường đôi">Giường đôi</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Số ghế</label>
                            <input 
                                type="number" 
                                name="totalSeats"
                                className={styles.formControl}
                                value={formData.totalSeats}
                                onChange={handleChange}
                                min="10"
                                max="100"
                                required
                            />
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

export default BusModal;
