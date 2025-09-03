import { useState, useEffect } from "react";
import type { Status } from "../Types/Types";
import { getAllStatuses } from "../Services/Api";

export const useStatuses = (token: string | null) => {
    const [statuses, setStatuses] = useState<Status[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }
        
        setLoading(true);
        setError(null);

        getAllStatuses(token)
            .then(setStatuses)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { statuses, setStatuses, loading, error };
};
