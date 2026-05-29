import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import StationFilter from '../../components/Station/StationFilter';
import StationTable from '../../components/Station/StationTable';
import StationModal from '../../components/Station/StationModal';
import StationDetailModal from '../../components/Station/StationDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './StationManagement.module.css';

const StationManagement = () => {
    const [stations, setStations] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedStationDetail, setSelectedStationDetail] = useState(null);

    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchStations = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/station', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined,
                },
            });

            const data = response.data;
            setStations(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);
        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách trạm dừng');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchStations();
    }, [fetchStations]);

    const handleSearch = useCallback((newKeyword) => {
        setKeyword(newKeyword);
        setPage(1);
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
        setEditingStation(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (station) => {
        setEditingStation(station);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa trạm dừng này không?')) {
            try {
                await api.patch(`/admin/station/edit/${id}`, { deleted: true });
                fetchStations();
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa trạm dừng');
            }
        }
    };

    const handleToggleStatus = async (station) => {
        const newStatus = station.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/station/edit/${station.id}`, { status: newStatus });
            fetchStations();
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/station/detail/${id}`);
            setSelectedStationDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết trạm dừng');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingStation) {
                await api.patch(`/admin/station/edit/${editingStation.id}`, formData);
            } else {
                await api.post('/admin/station/create', formData);
            }
            fetchStations();
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Trạm dừng</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và theo dõi danh sách bến xe / trạm dừng trong hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <StationFilter
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
                    <StationTable
                        stations={stations}
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

            <StationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingStation}
            />

            <StationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                station={selectedStationDetail}
            />
        </div>
    );
};

export default StationManagement;
