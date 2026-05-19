import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Pagination.module.css';

const Pagination = ({ paginationObject, onPageChange }) => {
    if (!paginationObject || paginationObject.totalPages <= 1) return null;

    const { currentPage, totalPages, totalItems, itemPerPage, startIndex } = paginationObject;

    const generatePageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }
        return pages;
    };

    const endIndex = Math.min(startIndex + itemPerPage, totalItems);

    return (
        <div className={styles.pagination}>
            <div className={styles.info}>
                Hiển thị <strong>{startIndex + 1}</strong> đến <strong>{endIndex}</strong> trong tổng số <strong>{totalItems}</strong> kết quả
            </div>
            
            <div className={styles.controls}>
                <button 
                    className={styles.pageBtn}
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <FaChevronLeft size={12} />
                </button>
                
                {generatePageNumbers().map(page => (
                    <button
                        key={page}
                        className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                        onClick={() => onPageChange(page)}
                    >
                        {page}
                    </button>
                ))}

                <button 
                    className={styles.pageBtn}
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <FaChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
