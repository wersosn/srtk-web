import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Track, Facility } from '../Types/Types';

interface FilterTracksProps {
    tracks: Track[];
    onFilterChange: (facilityId?: number) => void;
}

const FilterTracks: React.FC<FilterTracksProps> = ({ onFilterChange }) => {
    const [selectedFacilityId, setSelectedFacilityId] = useState<number | undefined>(undefined);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    // Pobieranie wszystkich obiektów z bazy:
    const fetchFacilities = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/facilities', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(t("api.facilityError"));
            }
            const data = await res.json();
            setFacilities(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    // Filtr torów po obiekcie:
    const handleFacilityChange = (value: string) => {
        const id = value ? Number(value) : undefined;
        setSelectedFacilityId(id);
        onFilterChange(id);
    };

    // Reset filtrów:
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