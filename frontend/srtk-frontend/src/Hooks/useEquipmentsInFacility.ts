import { useState, useEffect } from "react";
import type { Equipment } from "../Types/Types";
import { getAllEquipmentsInFacility } from "../Services/Api";

export const useEquipmentsInFacility = (token: string | null, facilityId: number | null) => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || facilityId === null) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllEquipmentsInFacility(facilityId, token)
            .then(setEquipmentList)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token, facilityId]);

    return { equipmentList, loading, error };
};