import { useState, useEffect } from "react";
import type { Client } from "../Types/Types";
import { getAllClients } from "../Api/Api";

export const useClients = (token: string | null) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loadingClients, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = () => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllClients(token)
            .then(data => setClients(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchClients();
    }, [token]);

    return { clients, setClients, loadingClients, error, refreshClients: fetchClients };
};