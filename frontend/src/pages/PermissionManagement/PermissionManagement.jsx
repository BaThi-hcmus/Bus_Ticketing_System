import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import PermissionFilter from '../../components/Permission/PermissionFilter';
import PermissionTable from '../../components/Permission/PermissionTable';
import PermissionModal from '../../components/Permission/PermissionModal';
import PermissionDetailModal from '../../components/Permission/PermissionDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './PermissionManagement.module.css';

const PermissionManagement = () => {
    // Data states
    const [permissions, setPermissions] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPermissionDetail, setSelectedPermissionDetail] = useState(null);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchPermissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/permission', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setPermissions(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách quyền');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchPermissions();
    }, [fetchPermissions]);

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
        setEditingPermission(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (permission) => {
        setEditingPermission(permission);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa quyền này không?')) {
            try {
                await api.patch(`/admin/permission/edit/${id}`, { deleted: true });
                fetchPermissions(); // Reload list
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa quyền');
            }
        }
    };

    const handleToggleStatus = async (permission) => {
        const newStatus = permission.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/permission/edit/${permission.id}`, { status: newStatus });
            fetchPermissions(); // Cập nhật lại danh sách sau khi đổi
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/permission/detail/${id}`);
            setSelectedPermissionDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết quyền');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingPermission) {
                // Edit
                await api.patch(`/admin/permission/edit/${editingPermission.id}`, formData);
            } else {
                // Create
                await api.post('/admin/permission/create', formData);
            }
            fetchPermissions(); // Reload list after success
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Quyền (Permissions)</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và theo dõi danh sách toàn bộ quyền truy cập trong hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <PermissionFilter
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
                    <PermissionTable
                        permissions={permissions}
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

            <PermissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingPermission}
            />

            <PermissionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                permission={selectedPermissionDetail}
            />
        </div>
    );
};

export default PermissionManagement;
