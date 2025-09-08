import { useState } from "react";
import type { Equipment } from "../Types/Types";

export function useFilteredEquipments(equipments: Equipment[]) {
    const [filteredEquipments, setFilteredEquipments] = useState<Equipment[]>(equipments);

    const applyFilter = (facilityId?: number) => {
        let result = equipments;
        if (facilityId) {
            result = result.filter(t => t.facilityId === facilityId);
        }
        setFilteredEquipments(result);
    };

    return { filteredEquipments, setFilteredEquipments, applyFilter};
}