import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import RoleFilter from '../../components/Role/RoleFilter';
import RoleTable from '../../components/Role/RoleTable';
import RoleModal from '../../components/Role/RoleModal';
import RoleDetailModal from '../../components/Role/RoleDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './RoleManagement.module.css';

const RoleManagement = () => {
    // Data states
    const [roles, setRoles] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRoleDetail, setSelectedRoleDetail] = useState(null);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchRoles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/role', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setRoles(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách vai trò');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleSearch = (newKeyword) => {
        setKeyword(newKeyword);
        setPage(1);
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
        setEditingRole(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này không?')) {
            try {
                await api.patch(`/admin/role/edit/${id}`, { deleted: true });
                fetchRoles();
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa vai trò');
            }
        }
    };

    const handleToggleStatus = async (role) => {
        const newStatus = role.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/role/edit/${role.id}`, { status: newStatus });
            fetchRoles();
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/role/detail/${id}`);
            setSelectedRoleDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết vai trò');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingRole) {
                await api.patch(`/admin/role/edit/${editingRole.id}`, formData);
            } else {
                await api.post('/admin/role/create', formData);
            }
            fetchRoles();
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Vai trò (Roles)</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và phân quyền cho các vai trò trong hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <RoleFilter
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
                    <RoleTable
                        roles={roles}
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

            <RoleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingRole}
            />

            <RoleDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                role={selectedRoleDetail}
            />
        </div>
    );
};

export default RoleManagement;
