import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import RouteFilter from '../../components/Route/RouteFilter';
import RouteTable from '../../components/Route/RouteTable';
import RouteModal from '../../components/Route/RouteModal';
import RouteDetailModal from '../../components/Route/RouteDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './RouteManagement.module.css';

const RouteManagement = () => {
    // Data states
    const [routes, setRoutes] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRouteDetail, setSelectedRouteDetail] = useState(null);
    const [stationList, setStationList] = useState([]);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchStations = async () => {
        try {
            const response = await api.get('/admin/station/all');
            setStationList(response.data || []);
        } catch (err) {
            console.error('Không thể tải danh sách bến xe', err);
        }
    };

    const fetchRoutes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/route', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setRoutes(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách tuyến đường');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchRoutes();
        fetchStations();
    }, [fetchRoutes]);

    const handleSearch = useCallback((newKeyword) => {
        setKeyword(newKeyword);
        setPage(1); // Reset page on new search
    }, []);

    const handleStatusChange = useCallback((newStatus) => {
        setStatus(newStatus);
        setPage(1);
    }, []);

    const handleSortChange = useCallback((newSortType) => {
        setSortType(newSortType);
        setPage(1);
    }, []);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleAddClick = () => {
        setEditingRoute(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (route) => {
        setEditingRoute(route);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tuyến đường này không?')) {
            try {
                // Xóa mềm bằng PATCH
                await api.patch(`/admin/route/edit/${id}`, { deleted: true });
                fetchRoutes(); // Reload list
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa tuyến đường');
            }
        }
    };

    const handleToggleStatus = async (route) => {
        const newStatus = route.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/route/edit/${route.id}`, { status: newStatus });
            fetchRoutes(); // Cập nhật lại danh sách sau khi đổi
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái tuyến đường');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/route/detail/${id}`);
            setSelectedRouteDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết tuyến đường');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingRoute) {
                // Edit
                await api.patch(`/admin/route/edit/${editingRoute.id}`, formData);
            } else {
                // Create
                await api.post('/admin/route/create', formData);
            }
            fetchRoutes(); // Reload list after success
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err; // Re-throw to keep modal loading state if needed
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Tuyến đường</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và theo dõi danh sách toàn bộ tuyến đường xe khách.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <RouteFilter
                onSearch={handleSearch}
                onStatusChange={handleStatusChange}
                onSortChange={handleSortChange}
                onAddClick={handleAddClick}
                statusOptions={filterStatusOptions}
                sortOptions={sortList}
            />

            {loading ? (
                <div className={styles.loadingWrapper}>Đang tải dữ liệu...</div>
            ) : (
                <>
                    <RouteTable
                        routes={routes}
                        startIndex={paginationObj ? paginationObj.startIndex : 0}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        onToggleStatus={handleToggleStatus}
                        onView={handleViewClick}
                    />

                    <Pagination
                        paginationObject={paginationObj}
                        onPageChange={handlePageChange}
                    />
                </>
            )}

            <RouteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingRoute}
                stationList={stationList}
            />

            <RouteDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                route={selectedRouteDetail}
            />
        </div>
    );
};

export default RouteManagement;
