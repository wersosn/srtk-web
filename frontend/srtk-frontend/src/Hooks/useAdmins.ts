import { useState, useEffect } from "react";
import type { Admin} from "../Types/Types";
import { getAllAdmins } from "../Services/Api";

export const useAdmins = (token: string | null) => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loadingAdmins, setLoading] = useState(true);
    const [errorAdmin, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllAdmins(token)
            .then(data => setAdmins(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { admins, setAdmins, loadingAdmins, errorAdmin };
};