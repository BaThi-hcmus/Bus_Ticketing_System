import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import BusFilter from '../../components/Bus/BusFilter';
import BusTable from '../../components/Bus/BusTable';
import BusModal from '../../components/Bus/BusModal';
import BusDetailModal from '../../components/Bus/BusDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './BusManagement.module.css';

const BusManagement = () => {
    // Data states
    const [buses, setBuses] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBusDetail, setSelectedBusDetail] = useState(null);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchBuses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/bus', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setBuses(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách xe bus');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchBuses();
    }, [fetchBuses]);

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
        setEditingBus(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (bus) => {
        setEditingBus(bus);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa xe bus này không?')) {
            try {
                // Gọi API PATCH và gửi body { deleted: true } để thực hiện xóa mềm
                await api.patch(`/admin/bus/edit/${id}`, { deleted: true });
                fetchBuses(); // Reload list
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa xe bus');
            }
        }
    };

    const handleToggleStatus = async (bus) => {
        const newStatus = bus.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/bus/edit/${bus.id}`, { status: newStatus });
            fetchBuses(); // Cập nhật lại danh sách sau khi đổi
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/bus/detail/${id}`);
            setSelectedBusDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết xe bus');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingBus) {
                // Edit
                await api.patch(`/admin/bus/edit/${editingBus.id}`, formData);
            } else {
                // Create
                await api.post('/admin/bus/create', formData);
            }
            fetchBuses(); // Reload list after success
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err; // Re-throw to keep modal loading state if needed
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Xe Bus</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và theo dõi danh sách toàn bộ xe bus trong hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <BusFilter
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
                    <BusTable
                        buses={buses}
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

            <BusModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingBus}
            />

            <BusDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                bus={selectedBusDetail}
            />
        </div>
    );
};

export default BusManagement;
