import { useState, useEffect } from "react";
import type { Admin} from "../Types/Types";
import { getAllAdmins } from "../Services/Api";
import { useAuth } from "../User/AuthContext";

export const useAdmins = (token: string | null) => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [loadingAdmins, setLoading] = useState(true);
    const [errorAdmin, setError] = useState<string | null>(null);
    const { facilityId } = useAuth();

    const fetchAdmins = () => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllAdmins(token)
            .then(data => {
                if (facilityId && facilityId !== 0) {
                    setAdmins(data.filter((a: Admin) => a.facilityId === facilityId));
                } else {
                    setAdmins(data);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchAdmins();
    }, [token]);

    return { admins, setAdmins, loadingAdmins, errorAdmin, refreshAdmins: fetchAdmins };
};