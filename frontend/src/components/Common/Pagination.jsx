import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import styles from './Pagination.module.css';

const Pagination = ({ paginationObject, onPageChange }) => {
    if (!paginationObject) return null;

    const currentPage = Number(paginationObject.currentPage);
    const totalPages = Number(paginationObject.totalPages);
    const totalItems = Number(paginationObject.totalItems || 0);
    const itemPerPage = Number(paginationObject.itemPerPage);
    const startIndex = Number(paginationObject.startIndex);

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
            <div className={styles.controls}>
                <button 
                    className={styles.pageBtn}
                    disabled={currentPage <= 1}
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
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <FaChevronRight size={12} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
