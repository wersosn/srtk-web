import { useState, useEffect } from "react";
import type { Facility } from "../Types/Types";
import { getAllFacilities } from "../Services/Api";

export const useFacilities = (token: string | null) => {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }
        
        setLoading(true);
        setError(null);

        getAllFacilities(token)
            .then(setFacilities)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { facilities, loading, error };
};
