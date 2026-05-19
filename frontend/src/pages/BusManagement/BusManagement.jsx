import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import BusFilter from '../../components/Bus/BusFilter';
import BusTable from '../../components/Bus/BusTable';
import BusModal from '../../components/Bus/BusModal';
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

    const handleSearch = (newKeyword) => {
        setKeyword(newKeyword);
        setPage(1); // Reset page on new search
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        setPage(1);
    };

    const handleSortChange = (newSortType) => {
        setSortType(newSortType);
        setPage(1);
    };

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
        if (window.confirm('Bạn có chắc chắn muốn xóa (xóa mềm) xe bus này không?')) {
            try {
                // Delete API calls
                await api.delete(`/admin/bus/delete/${id}`);
                fetchBuses(); // Reload list
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa xe bus');
            }
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
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
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
        </div>
    );
};

export default BusManagement;
