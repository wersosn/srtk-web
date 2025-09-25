import { useState, useEffect } from "react";
import type { Equipment } from "../Types/Types";
import { getAllEquipmentsForAdmin } from "../Api/Api";

export const useEquipmentsAdmin = (facilityId: number, token: string | null) => {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!token || facilityId == null) {
                return;
            }

            setLoading(true);
            setError(null);

            getAllEquipmentsForAdmin(facilityId, token!)
                .then(setEquipmentList)
                .catch(err => setError(err.message))
                .finally(() => setLoading(false));
        };

        fetchEquipment();
    }, [facilityId, token]);

    return { equipmentList, setEquipmentList, loading, error };
};