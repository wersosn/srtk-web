import { useState } from 'react';
import { useTranslation } from "react-i18next";
import type { Track } from '../Types/Types';
import { useFacilities } from '../Hooks/useFacilities';

interface FilterTracksProps {
    tracks: Track[];
    onFilterChange: (facilityId?: number) => void;
}

const FilterTracks: React.FC<FilterTracksProps> = ({ onFilterChange }) => {
    const [selectedFacilityId, setSelectedFacilityId] = useState<number | undefined>(undefined);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { facilities } = useFacilities(token);

    const handleFacilityChange = (value: string) => {
        const id = value ? Number(value) : undefined;
        setSelectedFacilityId(id);
        onFilterChange(id);
    };

    const handleReset = () => {
        setSelectedFacilityId(undefined);
        onFilterChange(undefined);
    }

    return (
        <>
            <div className="d-flex align-items-center gap-1">
                <select value={selectedFacilityId ?? ""} onChange={(e) => handleFacilityChange(e.target.value)} className="info-input">
                    <option value="">{t("filters.allFacilities")}</option>
                    {facilities.map(facility => (
                        <option key={facility.id} value={facility.id}>{facility.name}</option>
                    ))}
                </select>
                <button onClick={handleReset} className="btn-filter">{t("filters.reset")}</button>
            </div>
        </>
    )
}

export default FilterTracks;