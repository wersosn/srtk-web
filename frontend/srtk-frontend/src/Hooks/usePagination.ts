import { useState } from "react";

export function usePagination<T>(items: T[], elementsPerPage: number) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / elementsPerPage);

    const paginatedItems = items.slice((currentPage - 1) * elementsPerPage, currentPage * elementsPerPage);

    const goNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const goPrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    return { currentPage, totalPages, paginatedItems, goNext, goPrev, setCurrentPage };
}