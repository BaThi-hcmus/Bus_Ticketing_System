import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import UserFilter from '../../components/User/UserFilter';
import UserTable from '../../components/User/UserTable';
import UserModal from '../../components/User/UserModal';
import UserDetailModal from '../../components/User/UserDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './UserManagement.module.css';

const UserManagement = () => {
    // Data states
    const [users, setUsers] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUserDetail, setSelectedUserDetail] = useState(null);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/user', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setUsers(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

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
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
            try {
                await api.patch(`/admin/user/edit/${id}`, { deleted: true });
                fetchUsers();
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa người dùng');
            }
        }
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/user/edit/${user.id}`, { status: newStatus });
            fetchUsers();
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/user/detail/${id}`);
            setSelectedUserDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết người dùng');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingUser) {
                await api.patch(`/admin/user/edit/${editingUser.id}`, formData);
            } else {
                await api.post('/admin/user/create', formData);
            }
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Người dùng (Users)</h1>
                <p className={styles.pageDescription}>Quản trị viên có thể quản lý người dùng và phân quyền hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <UserFilter
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
                    <UserTable
                        users={users}
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

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingUser}
            />

            <UserDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                user={selectedUserDetail}
            />
        </div>
    );
};

export default UserManagement;
