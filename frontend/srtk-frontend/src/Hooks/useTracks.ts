import { useState, useEffect } from "react";
import type { Track } from "../Types/Types";
import { getAllTracks } from "../Api/Api";

export const useTracks = (token: string | null) => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllTracks(token)
            .then(setTracks)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token]);

    return { tracks, loading, error };
};