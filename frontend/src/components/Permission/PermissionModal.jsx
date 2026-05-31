import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './PermissionModal.module.css';
import api from '../../services/api';

const unwrapCategoryList = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

const PermissionModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const isEditMode = !!initialData;

    const [formData, setFormData] = useState({
        name: '',
        displayName: '',
        categoryPermissionId: '',
        status: 'active',
    });

    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchCategories = async () => {
            setCategoriesLoading(true);
            try {
                const res = await api.get('/admin/category-permission/all');
                let list = unwrapCategoryList(res);

                const currentCategory = initialData?.categoryPermission;
                if (
                    currentCategory &&
                    !list.some((cat) => cat.id === currentCategory.id)
                ) {
                    list = [currentCategory, ...list];
                }

                setCategories(list);
            } catch (err) {
                console.error('Failed to fetch categories', err);
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, [isOpen, initialData]);

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            const categoryId =
                initialData.categoryPermissionId ||
                initialData.categoryPermission?.id ||
                '';

            setFormData({
                name: initialData.name || '',
                displayName: initialData.displayName || '',
                categoryPermissionId: categoryId ? String(categoryId) : '',
                status: initialData.status || 'active',
            });
        } else {
            setFormData({
                name: '',
                displayName: '',
                categoryPermissionId: '',
                status: 'active',
            });
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.categoryPermissionId) {
            alert('Vui lòng chọn nhóm quyền từ danh sách.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name.trim(),
                displayName: formData.displayName.trim(),
                categoryPermissionId: Number(formData.categoryPermissionId),
            };

            if (isEditMode) {
                payload.status = formData.status;
            }

            await onSubmit(payload);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const noCategories = !categoriesLoading && categories.length === 0;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {isEditMode ? 'Chỉnh sửa quyền' : 'Thêm quyền mới'}
                    </h2>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.body}>
                        <div className={styles.formGroup}>
                            <label htmlFor="categoryPermissionId">
                                Nhóm quyền <span className={styles.required}>*</span>
                            </label>
                            <select
                                id="categoryPermissionId"
                                name="categoryPermissionId"
                                className={styles.formControl}
                                value={formData.categoryPermissionId}
                                onChange={handleChange}
                                required
                                disabled={categoriesLoading || noCategories}
                            >
                                <option value="">
                                    {categoriesLoading
                                        ? 'Đang tải danh sách nhóm quyền...'
                                        : '-- Chọn nhóm quyền --'}
                                </option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className={styles.hint}>
                                Chọn nhóm quyền có sẵn (vd: Quản lý trạm dừng, Quản lý xe bus).
                            </p>
                            {noCategories && (
                                <p className={styles.warningText}>
                                    Chưa có nhóm quyền nào. Vui lòng tạo nhóm quyền trước khi thêm permission.
                                </p>
                            )}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Mã quyền (Code)</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                className={styles.formControl}
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="VD: station:create, station:view"
                                required
                                disabled={noCategories}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="displayName">Tên hiển thị</label>
                            <input
                                id="displayName"
                                type="text"
                                name="displayName"
                                className={styles.formControl}
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="VD: Tạo trạm dừng, Xem trạm dừng"
                                required
                                disabled={noCategories}
                            />
                        </div>

                        {isEditMode && (
                            <div className={styles.formGroup}>
                                <label htmlFor="status">Trạng thái</label>
                                <select
                                    id="status"
                                    name="status"
                                    className={styles.formControl}
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Hoạt động</option>
                                    <option value="inactive">Dừng hoạt động</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={`${styles.btn} ${styles.btnCancel}`}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className={`${styles.btn} ${styles.btnSubmit}`}
                            disabled={loading || categoriesLoading || noCategories}
                        >
                            {loading ? 'Đang xử lý...' : 'Lưu lại'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PermissionModal;
