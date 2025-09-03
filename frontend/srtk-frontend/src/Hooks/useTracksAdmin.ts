import { useState, useEffect } from "react";
import type { Track } from "../Types/Types";
import { getAllTracksForAdmin } from "../Services/Api";

export const useTracksAdmin = (token: string | null, facilityId: number | null) => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!token || facilityId === null) {
            return;
        }

        setLoading(true);
        setError(null);

        getAllTracksForAdmin(facilityId, token)
            .then(setTracks)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [token, facilityId]);

    return { tracks, setTracks, loading, error };
};