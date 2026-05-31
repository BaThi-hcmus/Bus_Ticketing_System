import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import CategoryPermissionFilter from '../../components/CategoryPermission/CategoryPermissionFilter';
import CategoryPermissionTable from '../../components/CategoryPermission/CategoryPermissionTable';
import CategoryPermissionModal from '../../components/CategoryPermission/CategoryPermissionModal';
import CategoryPermissionDetailModal from '../../components/CategoryPermission/CategoryPermissionDetailModal';
import Pagination from '../../components/Common/Pagination';
import styles from './CategoryPermissionManagement.module.css';

const CategoryPermissionManagement = () => {
    // Data states
    const [categories, setCategories] = useState([]);
    const [filterStatusOptions, setFilterStatusOptions] = useState([]);
    const [sortList, setSortList] = useState([]);
    const [paginationObj, setPaginationObj] = useState(null);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCategoryDetail, setSelectedCategoryDetail] = useState(null);

    // Query states
    const [status, setStatus] = useState('');
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [sortType, setSortType] = useState('');

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/admin/category-permission', {
                params: {
                    status: status || undefined,
                    keyword: keyword || undefined,
                    page: page,
                    sortType: sortType || undefined
                }
            });

            const data = response.data;
            setCategories(data.data || []);
            setFilterStatusOptions(data.filterStatusObject || []);
            setPaginationObj(data.paginationObject);
            if (data.sortList) setSortList(data.sortList);

        } catch (err) {
            setError(err.message || 'Lỗi khi tải danh sách danh mục quyền');
        } finally {
            setLoading(false);
        }
    }, [status, keyword, page, sortType]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

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
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (category) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
            try {
                await api.patch(`/admin/category-permission/edit/${id}`, { deleted: true });
                fetchCategories(); // Reload list
            } catch (err) {
                alert(err.message || 'Lỗi khi xóa danh mục');
            }
        }
    };

    const handleToggleStatus = async (category) => {
        const newStatus = category.status === 'active' ? 'inactive' : 'active';
        try {
            await api.patch(`/admin/category-permission/edit/${category.id}`, { status: newStatus });
            fetchCategories(); // Cập nhật lại danh sách sau khi đổi
        } catch (err) {
            alert(err.message || 'Lỗi khi đổi trạng thái');
        }
    };

    const handleViewClick = async (id) => {
        try {
            const response = await api.get(`/admin/category-permission/detail/${id}`);
            setSelectedCategoryDetail(response.data);
            setIsDetailModalOpen(true);
        } catch (err) {
            alert(err.message || 'Lỗi khi lấy chi tiết danh mục');
        }
    };

    const handleModalSubmit = async (formData) => {
        try {
            if (editingCategory) {
                // Edit
                await api.patch(`/admin/category-permission/edit/${editingCategory.id}`, formData);
            } else {
                // Create
                await api.post('/admin/category-permission/create', formData);
            }
            fetchCategories(); // Reload list after success
        } catch (err) {
            alert(err.message || 'Có lỗi xảy ra khi lưu dữ liệu');
            throw err;
        }
    };

    return (
        <div>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Quản lý Nhóm quyền</h1>
                <p className={styles.pageDescription}>Thêm, sửa, xóa và theo dõi danh sách nhóm quyền trong hệ thống.</p>
            </div>

            {error && <div className={styles.errorAlert}>{error}</div>}

            <CategoryPermissionFilter
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
                    <CategoryPermissionTable
                        categories={categories}
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

            <CategoryPermissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={editingCategory}
            />

            <CategoryPermissionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                category={selectedCategoryDetail}
            />
        </div>
    );
};

export default CategoryPermissionManagement;
