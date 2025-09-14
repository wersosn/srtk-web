import React from "react";
import arrowLeftIcon from "../assets/arrow-left.png";
import arrowLeftLightIcon from "../assets/arrow-left-light.png";
import arrowRightIcon from "../assets/arrow-right.png";
import arrowRightLightIcon from "../assets/arrow-right-light.png";
import { usePrefersDark } from '../Hooks/usePrefersDark';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (newPage: number) => void;
    t: any;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, t }) => {
    const isDark = usePrefersDark();
    const arrowL = isDark ? arrowLeftLightIcon : arrowLeftIcon;
    const arrowR = isDark ? arrowRightLightIcon : arrowRightIcon;

    return (
        <div className="pagination-container">
            <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1} className="icon-button" title={t("universal.prev")}>
                <img src={arrowL} alt="Poprzednia strona" style={{ width: '24px', height: '24px' }} />
            </button>
            <span className="page-info">
                {currentPage || 1}
            </span>
            <span className="page-info">
                /
            </span>
            <span className="page-info">
                {totalPages || 1}
            </span>
            <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages} className="icon-button" title={t("universal.next")}>
                <img src={arrowR} alt="Następna strona" style={{ width: '24px', height: '24px' }} />
            </button>
        </div>
    );
};

export default Pagination;
