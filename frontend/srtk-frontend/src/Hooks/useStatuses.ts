import { useState, useEffect } from "react";
import type { Status } from "../Types/Types";
import { getAllStatuses } from "../Services/Api";

export const useStatuses = (token: string | null) => {
    const [statuses, setStatuses] = useState<Status[]>([]);

    useEffect(() => {
        if (!token) {
            return;
        }
        
        getAllStatuses(token).then(setStatuses).catch(console.error);
    }, [token]);

    return { statuses };
};
