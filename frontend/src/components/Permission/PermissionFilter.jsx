import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import styles from './PermissionFilter.module.css';

const PermissionFilter = ({ 
    onSearch, 
    onStatusChange, 
    onSortChange, 
    onAddClick,
    sortOptions,
    statusOptions
}) => {
    const [keyword, setKeyword] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(keyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [keyword, onSearch]);

    return (
        <div className={styles.filterContainer}>
            <div className={styles.leftGroup}>
                <div className={styles.searchBox}>
                    <FaSearch className={styles.searchIcon} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm tên quyền..."
                        className={styles.searchInput}
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                
                <select 
                    className={styles.selectBox}
                    onChange={(e) => onStatusChange(e.target.value)}
                >
                    {statusOptions.map((opt, idx) => (
                        <option key={idx} value={opt.status}>
                            {opt.name}
                        </option>
                    ))}
                </select>

                <select 
                    className={styles.selectBox}
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    {sortOptions.map((opt, idx) => (
                        <option key={idx} value={opt.type}>
                            {opt.name}
                        </option>
                    ))}
                </select>
            </div>

            <button className={styles.addBtn} onClick={onAddClick}>
                <FaPlus /> Thêm quyền mới
            </button>
        </div>
    );
};

export default PermissionFilter;
