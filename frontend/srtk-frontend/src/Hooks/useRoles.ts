import { useState, useEffect } from "react";
import type { Role } from "../Types/Types";
import { getAllRoles } from "../Api/Api";

export const useRoles = (token: string | null) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }
        
        setLoading(true);
        setError(null);

        getAllRoles(token)
            .then(setRoles)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { roles, setRoles, loading, error };
};
