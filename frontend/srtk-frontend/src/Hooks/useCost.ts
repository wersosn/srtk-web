import { useEffect, useState } from "react";
import type { Equipment } from "../Types/Types";

export function useCost(equipmentQuantities: Record<number, number>, equipmentList: Equipment[]) {
    const [cost, setCost] = useState<number>(0);

    useEffect(() => {
        const calculateCost = () => {
            const equipmentCost = Object.entries(equipmentQuantities)
                .map(([id, qty]) => {
                    const equipment = equipmentList.find(e => e.id === parseInt(id));
                    return (equipment?.cost || 0) * qty;
                })
                .reduce((sum, val) => sum + val, 0);

            setCost(equipmentCost);
        };

        calculateCost();
    }, [equipmentQuantities, equipmentList]);

    return cost;
}
