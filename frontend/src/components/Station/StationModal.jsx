import React, { useState, useEffect, useCallback } from 'react';
import { FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import LocationSearchInput from '../Common/LocationSearchInput';
import styles from './StationModal.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DEFAULT_CENTER = [16.047079, 108.20623];
const DEFAULT_ZOOM = 6;

const MapResizeFix = () => {
    const map = useMap();
    useEffect(() => {
        const t1 = setTimeout(() => map.invalidateSize(), 100);
        const t2 = setTimeout(() => map.invalidateSize(), 400);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [map]);
    return null;
};

const MapFlyTo = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)) {
            map.flyTo([lat, lng], 15, { duration: 0.6 });
        }
    }, [lat, lng, map]);
    return null;
};

const MapClickHandler = ({ enabled, onMapClick }) => {
    useMapEvents({
        click: (e) => {
            if (enabled) onMapClick(e.latlng);
        },
    });
    return null;
};

const reverseGeocode = async (lat, lng) => {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { 'Accept-Language': 'vi-VN' } },
    );
    const data = await response.json();
    const address = data.display_name || 'Không xác định';
    const shortName = address.split(',')[0] || 'Điểm mới';
    return { address, name: shortName };
};

const StationModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        lat: '',
        lng: '',
        status: 'active',
    });
    const [isMapPickMode, setIsMapPickMode] = useState(false);
    const [locationInputKey, setLocationInputKey] = useState(0);
    const [formSeed, setFormSeed] = useState(0);
    const [loading, setLoading] = useState(false);
    const [geoLoading, setGeoLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsMapPickMode(false);
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
            setFormSeed((s) => s + 1);
        }
    }, [isOpen, initialData]);

    const applyLocation = useCallback((location) => {
        setFormData((prev) => ({
            ...prev,
            name: location.name || prev.name,
            address: location.address,
            lat: location.lat,
            lng: location.lng,
        }));
        setLocationInputKey((k) => k + 1);
        setIsMapPickMode(false);
    }, []);

    const handleMapClick = async (latlng) => {
        setGeoLoading(true);
        try {
            const { address, name } = await reverseGeocode(latlng.lat, latlng.lng);
            applyLocation({
                name,
                address,
                lat: parseFloat(latlng.lat.toFixed(6)),
                lng: parseFloat(latlng.lng.toFixed(6)),
            });
        } catch (error) {
            console.error(error);
            alert('Không lấy được địa chỉ từ vị trí trên bản đồ. Vui lòng thử lại.');
        } finally {
            setGeoLoading(false);
        }
    };

    const hasValidCoords =
        formData.lat !== '' &&
        formData.lng !== '' &&
        formData.lat != null &&
        formData.lng != null &&
        !Number.isNaN(Number(formData.lat)) &&
        !Number.isNaN(Number(formData.lng));

    const markerLat = hasValidCoords ? Number(formData.lat) : null;
    const markerLng = hasValidCoords ? Number(formData.lng) : null;

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.lat === '' || formData.lng === '' || formData.lat == null || formData.lng == null) {
            alert('Vui lòng chọn tên trạm từ gợi ý hoặc click bản đồ để có địa chỉ và tọa độ.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                lat: Number(formData.lat),
                lng: Number(formData.lng),
            };

            if (isEditMode) {
                payload.status = formData.status;
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
                        <div className={styles.layout}>
                            <div className={styles.formPanel}>
                                <div className={`${styles.formGroup} ${styles.nameFieldGroup}`}>
                                    <label>
                                        Tên trạm / bến xe <span className={styles.required}>*</span>
                                    </label>
                                    <LocationSearchInput
                                        key={`station-name-${formSeed}-${locationInputKey}`}
                                        initialValue={formData.name}
                                        valueOnSelect="name"
                                        onChange={(name) => setFormData((prev) => ({ ...prev, name }))}
                                        onSelectLocation={applyLocation}
                                        onPickOnMap={() => setIsMapPickMode((v) => !v)}
                                        isActiveMapPick={isMapPickMode}
                                        placeholder="VD: Bến xe Miền Đông, Ga Hà Nội..."
                                        autocompletePath="/admin/station/location/autocomplete"
                                    />
                                    <p className={styles.hint}>
                                        Gõ ít nhất 2 ký tự để gợi ý tên địa điểm. Chọn một gợi ý để tự điền địa chỉ và tọa độ, hoặc dùng icon bản đồ để chọn trên map.
                                    </p>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>
                                        Địa chỉ <span className={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        className={`${styles.formControl} ${styles.readOnly}`}
                                        value={formData.address}
                                        readOnly
                                        placeholder="Tự động điền khi chọn tên trạm hoặc click bản đồ"
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Vĩ độ (lat)</label>
                                        <input
                                            type="text"
                                            className={`${styles.formControl} ${styles.readOnly}`}
                                            value={hasValidCoords ? markerLat : ''}
                                            readOnly
                                            placeholder="Tự động điền"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Kinh độ (lng)</label>
                                        <input
                                            type="text"
                                            className={`${styles.formControl} ${styles.readOnly}`}
                                            value={hasValidCoords ? markerLng : ''}
                                            readOnly
                                            placeholder="Tự động điền"
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

                            <div className={styles.mapPanel}>
                                {isMapPickMode && (
                                    <div className={styles.mapHint}>
                                        Click trên bản đồ để chọn vị trí trạm dừng
                                        {geoLoading && ' — Đang lấy địa chỉ...'}
                                    </div>
                                )}
                                <MapContainer
                                    center={hasValidCoords ? [markerLat, markerLng] : DEFAULT_CENTER}
                                    zoom={hasValidCoords ? 15 : DEFAULT_ZOOM}
                                    className={styles.mapContainer}
                                    scrollWheelZoom
                                >
                                    <TileLayer
                                        attribution='&copy; OpenStreetMap'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapResizeFix />
                                    <MapFlyTo lat={markerLat} lng={markerLng} />
                                    <MapClickHandler enabled={isMapPickMode} onMapClick={handleMapClick} />
                                    {hasValidCoords && (
                                        <Marker position={[markerLat, markerLng]}>
                                            <Popup>{formData.name || formData.address}</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={`${styles.btn} ${styles.btnCancel}`} onClick={onClose} disabled={loading}>
                            Hủy
                        </button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`} disabled={loading || geoLoading}>
                            {loading ? 'Đang xử lý...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StationModal;
