'use client';

import { Pagination } from 'react-bootstrap';

export default function AppPagination({
    currentPage,
    totalPages,
    onPageChange,
    className = '',
}) {
    if (!totalPages || totalPages <= 1) {
        return null;
    }

    const safeCurrentPage = Math.min(currentPage, totalPages);

    let startPage = Math.max(1, safeCurrentPage - 2);
    let endPage = Math.min(totalPages, safeCurrentPage + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else {
            startPage = Math.max(1, endPage - 4);
        }
    }

    const pageNumbers = [];

    for (let pageNum = startPage; pageNum <= endPage; pageNum += 1) {
        pageNumbers.push(pageNum);
    }

    const handlePageClick = (page) => {
        onPageChange(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={`d-flex justify-content-center mt-5 ${className}`.trim()}>
            <Pagination className="flex-wrap justify-content-center pokedex-pagination">
                <Pagination.First
                    onClick={() => handlePageClick(1)}
                    disabled={safeCurrentPage === 1}
                />
                <Pagination.Prev
                    onClick={() => handlePageClick(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                />

                {pageNumbers.map((p) => (
                    <Pagination.Item
                        key={p}
                        active={p === safeCurrentPage}
                        onClick={() => handlePageClick(p)}
                    >
                        {p}
                    </Pagination.Item>
                ))}

                <Pagination.Next
                    onClick={() => handlePageClick(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                />
                <Pagination.Last
                    onClick={() => handlePageClick(totalPages)}
                    disabled={safeCurrentPage === totalPages}
                />
            </Pagination>
        </div>
    );
}
