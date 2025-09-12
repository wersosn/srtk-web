import { useEffect, useState } from "react";
import { getAllEquipmentsInFacility } from "../Services/Api";
import type { Equipment, Track } from "../Types/Types";

export function useEquipmentsInFacility(rentEquipment: boolean, track: Track | null, token: string | null) {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!rentEquipment) {
                setEquipmentList([]);
                return;
            }
            if (!track) return;

            try {
                if (token) {
                    const data = await getAllEquipmentsInFacility(track.facilityId, token);
                    setEquipmentList(data);
                }
            } catch (err: any) {
                console.error(err);
            }
        };

        fetchEquipment();
    }, [rentEquipment, track, token]);

    return equipmentList;
}
