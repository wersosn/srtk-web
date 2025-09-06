import { useState, useEffect } from "react";
import type { Equipment } from "../Types/Types";
import { getAllEquipmentsInFacility } from "../Services/Api";

export const useEquipment = (selectedTrackId: number | null, rentEquipment: boolean, tracks: any[], token: string | null) => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!token) {
                return;
            }

            if (!selectedTrackId || !rentEquipment) {
                setEquipmentList([]);
                return;
            }

            setLoading(true);
            setError(null);

            const track = tracks.find(t => t.id === selectedTrackId);
            if (!track) return;

            getAllEquipmentsInFacility(track.facilityId, token!)
                .then(setEquipmentList)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        };

        fetchEquipment();
    }, [selectedTrackId, rentEquipment, tracks, token]);

    return { equipmentList, setEquipmentList, loading, error };
};