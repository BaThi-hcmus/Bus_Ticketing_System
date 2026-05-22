import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaTrash, FaPlus, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';
import { MapContainer, TileLayer, useMap, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import styles from './RouteModal.module.css';
import api from '../../services/api';
import LocationSearchInput from '../Common/LocationSearchInput';

// Fix leaflet default icons issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component fix lỗi Leaflet render sai kích thước khi CSS transition thay đổi width
const MapResizeFix = ({ isVisible }) => {
    const map = useMap();
    useEffect(() => {
        let timeoutId;
        if (isVisible) {
            // Liên tục invalidate size trong suốt quá trình transition (0.6s)
            const intervalId = setInterval(() => {
                map.invalidateSize();
            }, 50);
            
            timeoutId = setTimeout(() => {
                clearInterval(intervalId);
                map.invalidateSize();
            }, 600);
            
            return () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        }
    }, [isVisible, map]);
    return null;
};

// Component quản lý chọn Điểm Đi / Điểm Đến
const EndpointSelector = ({ 
    type, // 'departure' | 'destination'
    label,
    selectedLocation, // obj { name, address, lat, lng }
    onSelect, // function(locationObj)
    onClear,
    pickingEndpoint, // current global picking state
    setPickingEndpoint,
    localStationList
}) => {
    // Component nội bộ để search trạm có sẵn
    const ExistingStationSearch = () => {
        const [searchTerm, setSearchTerm] = useState('');
        const filtered = localStationList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
        return (
            <div className={styles.locationSearchWrapper}>
                <input
                    type="text"
                    className={styles.formControl}
                    placeholder="Gõ để tìm trạm có sẵn..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
                {searchTerm && filtered.length > 0 && (
                    <ul className={styles.suggestionsList} style={{ display: 'block' }}>
                        {filtered.map(st => (
                            <li key={st.id} className={styles.suggestionItem} onClick={() => onSelect({ name: st.name, lat: st.lat, lng: st.lng })}>
                                <strong>{st.name}</strong>
                                <small>{st.address}</small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    if (selectedLocation) {
        return (
            <div className={styles.formGroup}>
                <label>{label} <span className={styles.required}>*</span></label>
                <div className={styles.selectedEndpointCard}>
                    <div className={styles.selectedEndpointInfo}>
                        <div className={styles.selectedEndpointName}>{selectedLocation.name}</div>
                        {selectedLocation.address && <div className={styles.selectedEndpointAddress}>{selectedLocation.address}</div>}
                    </div>
                    <button type="button" className={styles.changeEndpointBtn} onClick={onClear}>
                        Thay đổi
                    </button>
                </div>
            </div>
        );
    }

    if (pickingEndpoint === `${type}_menu`) {
        return (
            <div className={styles.formGroup}>
                <label>{label} <span className={styles.required}>*</span></label>
                <div className={styles.selectorPopover}>
                    <button type="button" className={styles.backBtn} onClick={() => setPickingEndpoint(null)}>
                        ← Quay lại
                    </button>
                    <div className={styles.optionsMenu}>
                        <div className={styles.optionItem} onClick={() => setPickingEndpoint(`${type}_existing`)}>
                            <div className={styles.optionIcon}>🚉</div>
                            <div className={styles.optionText}>
                                <div className={styles.optionTitle}>Chọn Trạm Có Sẵn</div>
                                <div className={styles.optionDesc}>Tìm và chọn từ danh sách trạm đã tạo</div>
                            </div>
                        </div>
                        <div className={styles.optionItem} onClick={() => setPickingEndpoint(`${type}_custom`)}>
                            <div className={styles.optionIcon}>📍</div>
                            <div className={styles.optionText}>
                                <div className={styles.optionTitle}>Tạo Địa Điểm Mới</div>
                                <div className={styles.optionDesc}>Tìm kiếm địa danh hoặc chọn trực tiếp trên bản đồ</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (pickingEndpoint === `${type}_existing`) {
        return (
            <div className={styles.formGroup}>
                <label>{label} <span className={styles.required}>*</span></label>
                <div className={styles.selectorPopover}>
                    <button type="button" className={styles.backBtn} onClick={() => setPickingEndpoint(`${type}_menu`)}>
                        ← Quay lại
                    </button>
                    <ExistingStationSearch />
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '8px', padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                        💡 Bạn cũng có thể click trực tiếp vào marker xanh lá trên bản đồ bên cạnh.
                    </div>
                </div>
            </div>
        );
    }

    if (pickingEndpoint === `${type}_custom` || pickingEndpoint === `${type}_custom_map`) {
        return (
            <div className={styles.formGroup}>
                <label>{label} <span className={styles.required}>*</span></label>
                <div className={styles.selectorPopover}>
                    <button type="button" className={styles.backBtn} onClick={() => setPickingEndpoint(`${type}_menu`)}>
                        ← Quay lại
                    </button>
                    <LocationSearchInput
                        placeholder="Nhập tên bến xe, địa danh..."
                        initialValue=""
                        onSelectLocation={onSelect}
                        isActiveMapPick={pickingEndpoint === `${type}_custom_map`}
                        onPickOnMap={() => setPickingEndpoint(pickingEndpoint === `${type}_custom_map` ? `${type}_custom` : `${type}_custom_map`)}
                        autocompletePath="/admin/route/location/autocomplete"
                    />
                </div>
            </div>
        );
    }

    // Trạng thái mặc định: Hiển thị thẻ bấm
    return (
        <div className={styles.formGroup}>
            <label>{label} <span className={styles.required}>*</span></label>
            <div className={styles.endpointCard} onClick={() => setPickingEndpoint(`${type}_menu`)}>
                <FaPlus style={{ color: '#94a3b8', fontSize: '1.2rem' }} />
                <span className={styles.endpointCardText}>Chọn {label.toLowerCase()}</span>
            </div>
        </div>
    );
};

// Component xử lý logic vẽ đường đi trên bản đồ bằng OSRM
const RoutingMachine = ({ departureStation, destinationStation, initialWaypoints, onRouteFound, isAddStationMode }) => {
    const map = useMap();
    const routingControlRef = useRef(null);
    // Cờ đánh dấu đã zoom fit lần đầu chưa - tránh auto-zoom mỗi lần kéo thả
    const hasFittedBoundsRef = useRef(false);

    // Khi bật/tắt chế độ "click map thêm trạm":
    // - Bật: tắt pointer-events trên đường vẽ SVG để click xuyên qua tới map
    // - Tắt: khôi phục pointer-events để admin có thể kéo thả waypoint
    useEffect(() => {
        const container = map.getContainer();
        if (isAddStationMode) {
            container.classList.add('add-station-mode');
        } else {
            container.classList.remove('add-station-mode');
        }
    }, [isAddStationMode, map]);

    useEffect(() => {
        if (!departureStation || !destinationStation) {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
                routingControlRef.current = null;
            }
            hasFittedBoundsRef.current = false;
            return;
        }

        // Xóa routing control cũ nếu có
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
        }
        hasFittedBoundsRef.current = false;

        // Xây dựng mảng waypoints (điểm neo trên đường đi)
        let waypoints = [];
        if (initialWaypoints && initialWaypoints.length > 0) {
            waypoints = initialWaypoints.map(wp => L.latLng(wp.lat, wp.lng));
        } else {
            waypoints = [
                L.latLng(departureStation.lat, departureStation.lng),
                L.latLng(destinationStation.lat, destinationStation.lng)
            ];
        }

        // Khởi tạo Routing Control kết nối OSRM cục bộ với cấu hình tùy chỉnh plan
        const routingControl = L.Routing.control({
            router: L.Routing.osrmv1({
                serviceUrl: 'http://localhost:5000/route/v1',
                profile: 'driving'
            }),
            plan: L.Routing.plan(waypoints, {
                createMarker: function(i, wp, n) {
                    // Không tạo marker kéo thả cho điểm đầu và cuối (để giữ cố định 2 đầu)
                    if (i === 0 || i === n - 1) {
                        return null; 
                    }
                    // Tạo một chấm tròn nhỏ (giống Google Maps) cho các điểm trung gian (được thêm khi kéo đường)
                    const marker = L.marker(wp.latLng, {
                        draggable: true,
                        icon: L.divIcon({
                            className: 'intermediate-waypoint',
                            html: '<div style="background-color: white; border: 3px solid #3b82f6; width: 14px; height: 14px; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: grab; margin-left: -7px; margin-top: -7px;"></div>',
                            iconSize: [14, 14],
                            iconAnchor: [0, 0] // Centered by negative margin in HTML
                        })
                    });
                    
                    // Click vào chấm tròn để xóa waypoint đó
                    marker.on('click', () => {
                        if (routingControlRef.current) {
                            const currentWaypoints = routingControlRef.current.getWaypoints();
                            // Loại bỏ waypoint vừa click
                            const newWaypoints = currentWaypoints.filter((_, index) => index !== i);
                            routingControlRef.current.setWaypoints(newWaypoints);
                        }
                    });

                    return marker;
                },
                addWaypoints: true,
                draggableWaypoints: true
            }),
            routeWhileDragging: true,      // Tính lại route khi đang kéo
            show: false,                    // Ẩn bảng chỉ dẫn lộ trình dạng text
            fitSelectedRoutes: false,       // TẮT auto-zoom
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
                addWaypoints: true          // Cho phép click/kéo line để thêm waypoint
            }
        }).addTo(map);

        // Lắng nghe sự kiện khi OSRM trả về route thành công
        routingControl.on('routesfound', function (e) {
            const routes = e.routes;
            const route = routes[0];

            // CHỈ zoom fit bounds 1 lần duy nhất khi route được tính lần đầu
            // Các lần kéo thả sau sẽ KHÔNG tự thu nhỏ bản đồ
            if (!hasFittedBoundsRef.current) {
                const bounds = L.latLngBounds(route.coordinates);
                map.fitBounds(bounds, { padding: [50, 50] });
                hasFittedBoundsRef.current = true;
            }

            // Lấy danh sách waypoints hiện tại (bao gồm cả các điểm admin đã kéo thả)
            const wp = routingControl.getWaypoints()
                .filter(w => w.latLng)
                .map(w => ({ lat: w.latLng.lat, lng: w.latLng.lng }));
            
            // Lưu toàn bộ tọa độ đường đi dạng JSON để gửi lên backend
            const routeGeometry = JSON.stringify(route.coordinates);
            
            // Tính khoảng cách (km) và thời gian ước tính (phút) từ OSRM
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

// Component phủ lên toàn bộ bản đồ để chặn mọi thao tác kéo thả và chỉ bắt sự kiện click thêm trạm
const AddStationOverlay = ({ isAddStationMode, onMapClick, routeGeometryJSON }) => {
    const map = useMap();
    
    if (!isAddStationMode) return null;

    return (
        <div 
            style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 9999, // Phủ lên trên cùng, che mọi thứ của leaflet
                cursor: 'crosshair',
                backgroundColor: 'transparent'
            }}
            onMouseDown={(e) => {
                // Chặn sự kiện truyền xuống leaflet-routing-machine
                e.stopPropagation();
            }}
            onMouseMove={(e) => {
                e.stopPropagation();
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
            }}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Lấy tọa độ latlng từ con trỏ chuột
                const latlng = map.mouseEventToLatLng(e.nativeEvent);
                
                let isOnRoute = !routeGeometryJSON; // Nếu không có ràng buộc routeGeometry thì coi như luôn đúng (khi pick điểm)
                if (routeGeometryJSON) {
                    try {
                        const coords = JSON.parse(routeGeometryJSON);
                        if (coords && coords.length > 0) {
                            const clickPt = map.latLngToLayerPoint(latlng);
                            let minDistance = Infinity;
                            for (let i = 0; i < coords.length - 1; i++) {
                                const p1 = map.latLngToLayerPoint(L.latLng(coords[i].lat, coords[i].lng));
                                const p2 = map.latLngToLayerPoint(L.latLng(coords[i+1].lat, coords[i+1].lng));
                                const dist = L.LineUtil.pointToSegmentDistance(clickPt, p1, p2);
                                if (dist < minDistance) {
                                    minDistance = dist;
                                }
                            }
                            if (minDistance <= 25) { 
                                isOnRoute = true;
                            }
                        }
                    } catch (err) {
                        console.error('Lỗi tính toán khoảng cách route', err);
                    }
                }

                if (isOnRoute) {
                    onMapClick(latlng);
                } else {
                    alert('Vui lòng click TRỰC TIẾP lên đường đi màu xanh để thêm trạm!');
                }
            }}
        />
    );
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
    const [pickingEndpoint, setPickingEndpoint] = useState(null); // 'departure' | 'destination' | null
    
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
                let dep = localStationList.find(s => s.name === initialData.departureLocation);
                let dest = localStationList.find(s => s.name === initialData.destinationLocation);
                
                // Nếu không tìm thấy trong list (tức là custom location), lấy từ waypoints
                if (!dep && parsedWp && parsedWp.length > 0) {
                    dep = { name: initialData.departureLocation, lat: parsedWp[0].lat, lng: parsedWp[0].lng };
                }
                if (!dest && parsedWp && parsedWp.length > 1) {
                    dest = { name: initialData.destinationLocation, lat: parsedWp[parsedWp.length-1].lat, lng: parsedWp[parsedWp.length-1].lng };
                }
                
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
            setPickingEndpoint(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    const handleDepartureSelect = (locationObj) => {
        setFormData(prev => ({ ...prev, departureLocation: locationObj.name }));
        setDepartureStation(locationObj);
        setInitialMapWaypoints(null); // Reset waypoints when changing endpoints
    };

    const handleDestinationSelect = (locationObj) => {
        setFormData(prev => ({ ...prev, destinationLocation: locationObj.name }));
        setDestinationStation(locationObj);
        setInitialMapWaypoints(null); // Reset waypoints when changing endpoints
    };

    const handleDepartureTextChange = (text) => {
        setFormData(prev => ({ ...prev, departureLocation: text }));
    };

    const handleDestinationTextChange = (text) => {
        setFormData(prev => ({ ...prev, destinationLocation: text }));
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

    // Handle map click to create a new station via Reverse Geocoding or pick endpoint
    const handleMapClick = async (latlng) => {
        if (!isAddStationMode && !pickingEndpoint) return;

        setLoading(true);
        try {
            // Call Nominatim API for Reverse Geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await response.json();
            
            const address = data.display_name || 'Không xác định';
            const shortName = address.split(',')[0] || 'Điểm Mới';
            const locationName = `${shortName}`;

            if (pickingEndpoint) {
                const locationObj = {
                    name: locationName,
                    address: address,
                    lat: latlng.lat,
                    lng: latlng.lng
                };
                if (pickingEndpoint === 'departure_custom' || pickingEndpoint === 'departure_custom_map') {
                    handleDepartureSelect(locationObj);
                } else {
                    handleDestinationSelect(locationObj);
                }
                setPickingEndpoint(null);
                setLoading(false);
                return;
            }

            // Nếu không phải pickingEndpoint thì là isAddStationMode
            const stationName = `Trạm dừng - ${shortName}`;

            // Create station via API
            const createRes = await api.post('/admin/station/create', {
                name: stationName,
                address: address,
                lat: latlng.lat,
                lng: latlng.lng
            });

            const newStation = createRes.data;

            // Tính khoảng cách từ điểm xuất phát đến trạm mới tạo
            let calculatedDistance = 0;
            if (departureStation && departureStation.lat && departureStation.lng) {
                try {
                    const osrmRes = await fetch(`http://localhost:5000/route/v1/driving/${departureStation.lng},${departureStation.lat};${latlng.lng},${latlng.lat}?overview=false`);
                    const osrmData = await osrmRes.json();
                    if (osrmData && osrmData.routes && osrmData.routes.length > 0) {
                        calculatedDistance = parseFloat((osrmData.routes[0].distance / 1000).toFixed(1));
                    }
                } catch(e) {
                    console.error('Lỗi khi tính khoảng cách từ trạm gốc:', e);
                }
            }

            // Update local station list and add it to route's stations
            setLocalStationList(prev => [...prev, newStation]);
            
            setStations(prev => [...prev, {
                stationId: newStation.id,
                distanceFromStart: calculatedDistance
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

    // Determine if map should be visible
    // Luôn hiển thị bản đồ theo yêu cầu của user
    const isMapVisible = true;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={`${styles.modal} ${isMapVisible ? styles.modalWithMap : styles.modalNoMap}`} onClick={e => e.stopPropagation()}>
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
                                    <EndpointSelector
                                        type="departure"
                                        label="Điểm đi"
                                        selectedLocation={departureStation}
                                        onSelect={(loc) => {
                                            handleDepartureSelect(loc);
                                            setPickingEndpoint(null);
                                        }}
                                        onClear={() => {
                                            setDepartureStation(null);
                                            setFormData(prev => ({ ...prev, departureLocation: '' }));
                                        }}
                                        pickingEndpoint={pickingEndpoint}
                                        setPickingEndpoint={setPickingEndpoint}
                                        localStationList={localStationList}
                                    />

                                    <EndpointSelector
                                        type="destination"
                                        label="Điểm đến"
                                        selectedLocation={destinationStation}
                                        onSelect={(loc) => {
                                            handleDestinationSelect(loc);
                                            setPickingEndpoint(null);
                                        }}
                                        onClear={() => {
                                            setDestinationStation(null);
                                            setFormData(prev => ({ ...prev, destinationLocation: '' }));
                                        }}
                                        pickingEndpoint={pickingEndpoint}
                                        setPickingEndpoint={setPickingEndpoint}
                                        localStationList={localStationList}
                                    />

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

                                {(isAddStationMode || (pickingEndpoint && pickingEndpoint.includes('custom'))) && (
                                    <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem' }}>
                                        {pickingEndpoint && pickingEndpoint.includes('custom')
                                            ? 'Chế độ chọn điểm: Click vào bất kỳ đâu trên bản đồ để chọn tọa độ làm điểm đầu/cuối.'
                                            : 'Chế độ Map: Vui lòng click trực tiếp lên đường đi màu xanh để tạo trạm dừng mới.'
                                        }
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
                    <div className={`${styles.rightPanel} ${!isMapVisible ? styles.rightPanelHidden : ''}`}>
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
                                isAddStationMode={isAddStationMode}
                            />

                            <MapResizeFix isVisible={isMapVisible} />

                            <AddStationOverlay 
                                isAddStationMode={isAddStationMode || (!!pickingEndpoint && pickingEndpoint.includes('custom'))}
                                onMapClick={handleMapClick}
                                routeGeometryJSON={pickingEndpoint ? null : formData.routeGeometry}
                            />

                            {/* Hiển thị Marker trạm có sẵn khi chọn Existing */}
                            {pickingEndpoint && pickingEndpoint.includes('existing') && localStationList.map(st => (
                                <Marker 
                                    key={`all-st-${st.id}`} 
                                    position={[st.lat, st.lng]}
                                    eventHandlers={{
                                        click: () => {
                                            const loc = { name: st.name, lat: st.lat, lng: st.lng };
                                            if (pickingEndpoint === 'departure_existing') {
                                                handleDepartureSelect(loc);
                                            } else {
                                                handleDestinationSelect(loc);
                                            }
                                            setPickingEndpoint(null);
                                        }
                                    }}
                                >
                                    <Popup>
                                        <strong>{st.name}</strong><br/>
                                        <span style={{ fontSize: '12px' }}>Click để chọn trạm này</span>
                                    </Popup>
                                </Marker>
                            ))}

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
