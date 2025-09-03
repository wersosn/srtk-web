import { useState, useEffect } from "react";
import type { Client } from "../Types/Types";
import { getAllClients } from "../Services/Api";

export const useClients = (token: string | null) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllClients(token)
            .then(data => setClients(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { clients, setClients, loading, error };
};