import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus } from 'react-icons/fa';
import styles from './RouteModal.module.css';

const RouteModal = ({ isOpen, onClose, onSubmit, initialData, stationList = [] }) => {
    const [formData, setFormData] = useState({
        departureLocation: '',
        destinationLocation: '',
        distanceKm: '',
        estimatedDuration: ''
    });
    
    // stations array: { stationId: number, distanceFromStart: number }
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    departureLocation: initialData.departureLocation || '',
                    destinationLocation: initialData.destinationLocation || '',
                    distanceKm: initialData.distanceKm || '',
                    estimatedDuration: initialData.estimatedDuration || ''
                });
                
                // Nạp danh sách trạm nếu đang Edit
                if (initialData.routeStations && initialData.routeStations.length > 0) {
                    const sorted = [...initialData.routeStations].sort((a,b) => a.stopOrder - b.stopOrder);
                    setStations(sorted.map(s => ({
                        stationId: s.stationId,
                        distanceFromStart: s.distanceFromStart
                    })));
                } else {
                    setStations([]);
                }
            } else {
                setFormData({
                    departureLocation: '',
                    destinationLocation: '',
                    distanceKm: '',
                    estimatedDuration: ''
                });
                setStations([]);
            }
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddStation = () => {
        setStations(prev => [...prev, { stationId: '', distanceFromStart: '' }]);
    };

    const handleRemoveStation = (index) => {
        setStations(prev => prev.filter((_, i) => i !== index));
    };

    const handleStationChange = (index, field, value) => {
        const newStations = [...stations];
        newStations[index][field] = value;
        setStations(newStations);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate stations
        for (let i = 0; i < stations.length; i++) {
            if (!stations[i].stationId || stations[i].distanceFromStart === '') {
                alert(`Vui lòng điền đầy đủ thông tin ở Trạm thứ ${i + 1}`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                distanceKm: Number(formData.distanceKm),
                estimatedDuration: Number(formData.estimatedDuration),
                stations: stations.map(s => ({
                    stationId: Number(s.stationId),
                    distanceFromStart: Number(s.distanceFromStart)
                }))
            };
            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{initialData ? 'Chỉnh sửa Tuyến đường' : 'Thêm Tuyến đường mới'}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div className={styles.formGroup}>
                            <label>Điểm đi (Tỉnh/Thành phố) <span className={styles.required}>*</span></label>
                            <input 
                                type="text" 
                                name="departureLocation"
                                value={formData.departureLocation}
                                onChange={handleChange}
                                placeholder="VD: TP. Hồ Chí Minh"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Điểm đến (Tỉnh/Thành phố) <span className={styles.required}>*</span></label>
                            <input 
                                type="text" 
                                name="destinationLocation"
                                value={formData.destinationLocation}
                                onChange={handleChange}
                                placeholder="VD: Đà Lạt"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Khoảng cách (km) <span className={styles.required}>*</span></label>
                            <input 
                                type="number" 
                                name="distanceKm"
                                value={formData.distanceKm}
                                onChange={handleChange}
                                placeholder="VD: 300"
                                min="1"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Thời gian di chuyển (phút) <span className={styles.required}>*</span></label>
                            <input 
                                type="number" 
                                name="estimatedDuration"
                                value={formData.estimatedDuration}
                                onChange={handleChange}
                                placeholder="VD: 480"
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Lộ trình các trạm dừng <span className={styles.required}>*</span></h3>
                        <button type="button" onClick={handleAddStation} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaPlus size={12} /> Thêm trạm
                        </button>
                    </div>

                    {stations.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#f8fafc', borderRadius: '6px', color: '#64748b' }}>
                            Chưa có trạm dừng nào. Vui lòng thêm ít nhất 2 trạm (Điểm đầu và Điểm cuối).
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                            {stations.map((station, index) => (
                                <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ width: '30px', fontWeight: 'bold', color: '#475569', alignSelf: 'center', paddingTop: '20px' }}>
                                        #{index + 1}
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 2, marginBottom: 0 }}>
                                        <label>Tên Bến xe / Trạm dừng</label>
                                        <select 
                                            value={station.stationId} 
                                            onChange={(e) => handleStationChange(index, 'stationId', e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        >
                                            <option value="">-- Chọn Trạm --</option>
                                            {stationList.map(st => (
                                                <option key={st.id} value={st.id}>{st.name} ({st.address})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                                        <label>Khoảng cách từ gốc (km)</label>
                                        <input 
                                            type="number" 
                                            value={station.distanceFromStart}
                                            onChange={(e) => handleStationChange(index, 'distanceFromStart', e.target.value)}
                                            placeholder="VD: 0"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => handleRemoveStation(index)}
                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', height: '37px' }}
                                        title="Xóa trạm"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles.actions} style={{ marginTop: '20px' }}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                            Hủy bỏ
                        </button>
                        <button type="submit" className={styles.submitBtn} disabled={loading || stations.length < 2}>
                            {loading ? 'Đang lưu...' : (initialData ? 'Lưu thay đổi' : 'Tạo Tuyến đường')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RouteModal;
