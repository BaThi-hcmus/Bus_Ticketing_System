import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTrash, FaPlus, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import styles from './RouteModal.module.css';
import api from '../../services/api';

// Fix leaflet default icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle routing logic on the map
const RoutingMachine = ({ departureStation, destinationStation, initialWaypoints, onRouteFound }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!departureStation || !destinationStation) {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
            return;
        }

        // Clean up previous control
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }

        // Build waypoints array
        let waypoints = [];
        if (initialWaypoints && initialWaypoints.length > 0) {
            waypoints = initialWaypoints.map(wp => L.latLng(wp.lat, wp.lng));
        } else {
            waypoints = [
                L.latLng(departureStation.lat, departureStation.lng),
                L.latLng(destinationStation.lat, destinationStation.lng)
            ];
        }

        // Initialize Routing Control with local OSRM
        const routingControl = L.Routing.control({
            waypoints: waypoints,
            router: L.Routing.osrmv1({
                serviceUrl: 'http://localhost:5000/route/v1',
                profile: 'driving'
            }),
            routeWhileDragging: true,
            show: false, // hide the textual itinerary panel
            addWaypoints: true, // Allow user to add waypoints by dragging the line
            fitSelectedRoutes: true,
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }]
            },
            createMarker: function() { return null; } // We don't need default markers, we can add our own or just let the line show
        }).addTo(map);

        routingControl.on('routesfound', function (e) {
            const routes = e.routes;
            const route = routes[0];

            // Extract the dragged waypoints
            const wp = routingControl.getWaypoints().filter(w => w.latLng).map(w => ({ lat: w.latLng.lat, lng: w.latLng.lng }));
            
            // Extract route geometry for backend storage
            const routeGeometry = JSON.stringify(route.coordinates);
            
            // Calculate distance & duration
            const distanceKm = (route.summary.totalDistance / 1000).toFixed(1);
            const durationMin = Math.round(route.summary.totalTime / 60);

            onRouteFound({
                distanceKm: parseFloat(distanceKm),
                estimatedDuration: durationMin,
                waypoints: wp,
                routeGeometry: routeGeometry
            });
        });

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }
        };
    }, [map, departureStation, destinationStation, initialWaypoints]);

    return null;
};

// Component to handle map clicks for adding stations
const MapClickHandler = ({ isAddStationMode, onMapClick }) => {
    useMapEvents({
        click(e) {
            if (isAddStationMode) {
                onMapClick(e.latlng);
            }
        }
    });
    return null;
};

const RouteModal = ({ isOpen, onClose, onSubmit, initialData, stationList = [] }) => {
    const [formData, setFormData] = useState({
        departureLocation: '',
        destinationLocation: '',
        distanceKm: '',
        estimatedDuration: '',
        routeGeometry: '',
        waypoints: ''
    });
    
    // stations array: { stationId: number, distanceFromStart: number }
    const [stations, setStations] = useState([]);
    
    // Map specific states
    const [departureStation, setDepartureStation] = useState(null);
    const [destinationStation, setDestinationStation] = useState(null);
    const [initialMapWaypoints, setInitialMapWaypoints] = useState(null);
    const [isAddStationMode, setIsAddStationMode] = useState(false);
    
    // For updating local station list with dynamically created stations
    const [localStationList, setLocalStationList] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLocalStationList(stationList);
    }, [stationList]);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    departureLocation: initialData.departureLocation || '',
                    destinationLocation: initialData.destinationLocation || '',
                    distanceKm: initialData.distanceKm || '',
                    estimatedDuration: initialData.estimatedDuration || '',
                    routeGeometry: initialData.routeGeometry || '',
                    waypoints: initialData.waypoints || ''
                });
                
                // Parse waypoints from JSON if editing
                if (initialData.waypoints) {
                    try {
                        const parsedWp = JSON.parse(initialData.waypoints);
                        setInitialMapWaypoints(parsedWp);
                    } catch (e) {
                        console.error('Failed to parse waypoints', e);
                    }
                } else {
                    setInitialMapWaypoints(null);
                }
                
                // Find and set departure and destination stations to render the map route
                const dep = localStationList.find(s => s.name === initialData.departureLocation);
                const dest = localStationList.find(s => s.name === initialData.destinationLocation);
                setDepartureStation(dep || null);
                setDestinationStation(dest || null);

                // Load route stations
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
                    estimatedDuration: '',
                    routeGeometry: '',
                    waypoints: ''
                });
                setStations([]);
                setDepartureStation(null);
                setDestinationStation(null);
                setInitialMapWaypoints(null);
            }
            setIsAddStationMode(false);
        }
    }, [isOpen, initialData, localStationList]);

    const handleDepartureChange = (e) => {
        const value = e.target.value; // It is station name
        const station = localStationList.find(s => s.name === value);
        
        setFormData(prev => ({ ...prev, departureLocation: value }));
        setDepartureStation(station || null);
        setInitialMapWaypoints(null); // Reset waypoints when changing endpoints
    };

    const handleDestinationChange = (e) => {
        const value = e.target.value;
        const station = localStationList.find(s => s.name === value);
        
        setFormData(prev => ({ ...prev, destinationLocation: value }));
        setDestinationStation(station || null);
        setInitialMapWaypoints(null); // Reset waypoints when changing endpoints
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

    // Callback from RoutingMachine when route is calculated/dragged
    const handleRouteFound = useCallback((routeData) => {
        setFormData(prev => ({
            ...prev,
            distanceKm: routeData.distanceKm,
            estimatedDuration: routeData.estimatedDuration,
            routeGeometry: routeData.routeGeometry,
            waypoints: JSON.stringify(routeData.waypoints)
        }));
    }, []);

    // Handle map click to create a new station via Reverse Geocoding
    const handleMapClick = async (latlng) => {
        if (!isAddStationMode) return;

        setLoading(true);
        try {
            // Call Nominatim API for Reverse Geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();
            
            const address = data.display_name || 'Không xác định';
            const shortName = address.split(',')[0] || 'Trạm Mới';
            const stationName = `Trạm dừng - ${shortName}`;

            // Create station via API
            const createRes = await api.post('/admin/station/create', {
                name: stationName,
                address: address,
                lat: latlng.lat,
                lng: latlng.lng
            });

            const newStation = createRes.data;

            // Update local station list and add it to route's stations
            setLocalStationList(prev => [...prev, newStation]);
            
            setStations(prev => [...prev, {
                stationId: newStation.id,
                distanceFromStart: 0 // Default to 0, admin can adjust
            }]);

            // Turn off mode
            setIsAddStationMode(false);
            alert(`Thêm trạm thành công: ${stationName}`);

        } catch (error) {
            console.error('Reverse Geocoding error:', error);
            alert('Có lỗi xảy ra khi tạo trạm dừng từ bản đồ.');
        } finally {
            setLoading(false);
        }
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
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {initialData ? 'Chỉnh sửa Tuyến đường' : 'Thêm Tuyến đường mới'}
                    </h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>
                
                <div className={styles.modalLayout}>
                    {/* Left Panel: Form */}
                    <div className={styles.leftPanel}>
                        <form className={styles.form} onSubmit={handleSubmit} id="route-form">
                            <div className={styles.body}>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Điểm đi <span className={styles.required}>*</span></label>
                                        <select 
                                            className={styles.formControl}
                                            value={formData.departureLocation}
                                            onChange={handleDepartureChange}
                                            required
                                        >
                                            <option value="">-- Chọn Điểm đi --</option>
                                            {localStationList.map(st => (
                                                <option key={`dep-${st.id}`} value={st.name}>{st.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Điểm đến <span className={styles.required}>*</span></label>
                                        <select 
                                            className={styles.formControl}
                                            value={formData.destinationLocation}
                                            onChange={handleDestinationChange}
                                            required
                                        >
                                            <option value="">-- Chọn Điểm đến --</option>
                                            {localStationList.map(st => (
                                                <option key={`dest-${st.id}`} value={st.name}>{st.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Khoảng cách OSRM (km) <span className={styles.required}>*</span></label>
                                        <input 
                                            type="number" 
                                            name="distanceKm"
                                            className={styles.formControl}
                                            value={formData.distanceKm}
                                            onChange={(e) => setFormData(p => ({...p, distanceKm: e.target.value}))}
                                            placeholder="Được tính tự động"
                                            min="0"
                                            step="0.1"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>T.gian ước tính (phút) <span className={styles.required}>*</span></label>
                                        <input 
                                            type="number" 
                                            name="estimatedDuration"
                                            className={styles.formControl}
                                            value={formData.estimatedDuration}
                                            onChange={(e) => setFormData(p => ({...p, estimatedDuration: e.target.value}))}
                                            placeholder="Được tính tự động"
                                            min="1"
                                            required
                                        />
                                    </div>
                                </div>

                                <hr className={styles.divider} />
                                
                                <div className={styles.stationHeader}>
                                    <h3 className={styles.stationTitle}>
                                        Lộ trình các trạm dừng <span className={styles.required}>*</span>
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button 
                                            type="button" 
                                            className={styles.addStationBtn} 
                                            onClick={() => setIsAddStationMode(!isAddStationMode)}
                                            style={{ backgroundColor: isAddStationMode ? '#fee2e2' : '', borderColor: isAddStationMode ? '#fca5a5' : '', color: isAddStationMode ? '#ef4444' : '' }}
                                        >
                                            <FaMapMarkerAlt size={12} /> {isAddStationMode ? 'Hủy click map' : 'Click map thêm trạm'}
                                        </button>
                                        <button type="button" className={styles.addStationBtn} onClick={handleAddStation}>
                                            <FaPlus size={12} /> Thêm trạm thủ công
                                        </button>
                                    </div>
                                </div>

                                {isAddStationMode && (
                                    <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                                        Chế độ Map: Vui lòng click vào đường đi hoặc bất kỳ đâu trên bản đồ bên cạnh để tạo trạm dừng mới (Dùng Reverse Geocoding).
                                    </div>
                                )}

                                {stations.length === 0 ? (
                                    <div className={styles.emptyState}>
                                        Chưa có trạm dừng nào. Vui lòng thêm ít nhất 2 trạm (Điểm đầu và Điểm cuối).
                                    </div>
                                ) : (
                                    <div className={styles.stationList}>
                                        {stations.map((station, index) => (
                                            <div key={index} className={styles.stationItem}>
                                                <div className={styles.stationIndex}>
                                                    #{index + 1}
                                                </div>
                                                
                                                <div className={styles.stationInputGroup}>
                                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                                                        Tên Bến xe / Trạm dừng
                                                    </label>
                                                    <select 
                                                        className={styles.formControl}
                                                        value={station.stationId} 
                                                        onChange={(e) => handleStationChange(index, 'stationId', e.target.value)}
                                                        required
                                                    >
                                                        <option value="">-- Chọn Trạm --</option>
                                                        {localStationList.map(st => (
                                                            <option key={st.id} value={st.id}>{st.name} ({st.address})</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={styles.distanceInputGroup}>
                                                    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '8px', display: 'block' }}>
                                                        Khoảng cách từ gốc
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        className={styles.formControl}
                                                        value={station.distanceFromStart}
                                                        onChange={(e) => handleStationChange(index, 'distanceFromStart', e.target.value)}
                                                        placeholder="VD: 0"
                                                        min="0"
                                                        required
                                                    />
                                                </div>

                                                <button 
                                                    type="button" 
                                                    className={styles.deleteStationBtn}
                                                    onClick={() => handleRemoveStation(index)}
                                                    title="Xóa trạm"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>
                    
                    {/* Right Panel: Map */}
                    <div className={styles.rightPanel}>
                        <MapContainer 
                            center={[16.047079, 108.206230]} // Default center Vietnam (Da Nang)
                            zoom={5} 
                            className={styles.mapContainer}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            
                            <RoutingMachine 
                                departureStation={departureStation}
                                destinationStation={destinationStation}
                                initialWaypoints={initialMapWaypoints}
                                onRouteFound={handleRouteFound}
                            />

                            <MapClickHandler 
                                isAddStationMode={isAddStationMode}
                                onMapClick={handleMapClick}
                            />

                            {/* Show markers for stations added to the route */}
                            {stations.map((s, idx) => {
                                const st = localStationList.find(loc => loc.id == s.stationId);
                                if (st && st.lat && st.lng) {
                                    return (
                                        <Marker key={idx} position={[st.lat, st.lng]}>
                                            <Popup>
                                                Trạm #{idx + 1}: {st.name}
                                            </Popup>
                                        </Marker>
                                    )
                                }
                                return null;
                            })}
                        </MapContainer>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                        Hủy bỏ
                    </button>
                    <button type="submit" form="route-form" className={styles.submitBtn} disabled={loading || stations.length < 2}>
                        {loading ? 'Đang xử lý...' : (initialData ? 'Lưu thay đổi' : 'Tạo Tuyến đường')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RouteModal;
