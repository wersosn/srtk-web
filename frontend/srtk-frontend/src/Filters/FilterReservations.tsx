import { useState } from 'react';
import { useTranslation } from "react-i18next";
import type { Reservation, Track, Status } from '../Types/Types';

interface FilterReservationsProps {
    reservations: Reservation[];
    tracks: Track[];
    statuses: Status[];
    onFilterChange: (trackId?: number, statusId?: number, startDate?: string) => void;
}

const FilterReservations: React.FC<FilterReservationsProps> = ({ reservations, tracks, statuses, onFilterChange }) => {
    const [selectedTrackId, setSelectedTrackId] = useState<number | undefined>(undefined);
    const [selectedStatusId, setSelectedStatusId] = useState<number | undefined>(undefined);
    const [selectedStartDate, setSelectedStartDate] = useState<string | undefined>();
    const { t } = useTranslation();

    const handleTrackChange = (value: string) => {
        const id = value ? Number(value) : undefined;
        setSelectedTrackId(id);
        onFilterChange(id, selectedStatusId, selectedStartDate);
    };

    const handleStatusChange = (value: string) => {
        const id = value ? Number(value) : undefined;
        setSelectedStatusId(id);
        onFilterChange(selectedTrackId, id, selectedStartDate);
    };

    const handleStartDateChange = (value: string) => {
        const date = value || undefined;
        setSelectedStartDate(date);
        onFilterChange(selectedTrackId, selectedStatusId, date);
    }

    const handleReset = () => {
        setSelectedTrackId(undefined);
        setSelectedStatusId(undefined);
        setSelectedStartDate(undefined);
        onFilterChange(undefined, undefined, undefined);
    }

    return (
        <>
            <div className="d-flex flex-column flex-sm-row align-items-start align-sm-items-center gap-1">
                <input type="date" value={selectedStartDate ?? ""} onChange={(e) => handleStartDateChange(e.target.value)} className="info-input" />

                <select value={selectedTrackId ?? ""} onChange={(e) => handleTrackChange(e.target.value)} className="info-input">
                    <option value="">{t("filters.allTracks")}</option>
                    {tracks.map(track => (
                        <option key={track.id} value={track.id}>{track.name}</option>
                    ))}
                </select>

                <select value={selectedStatusId ?? ""} onChange={(e) => handleStatusChange(e.target.value)} className="info-input">
                    <option value="">{t("filters.allStatuses")}</option>
                    {statuses.map(status => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                </select>
                <button onClick={handleReset} className="btn-filter">{t("filters.reset")}</button>
            </div>
        </>
    )
}

export default FilterReservations;