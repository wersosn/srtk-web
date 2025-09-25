import { useEffect, useState } from "react";
import type { Track } from "../Types/Types";
import { getTrackById } from "../Api/Api";

export function useTrack(trackId: number, token: string | null) {
    const [track, setTrack] = useState<Track | null>(null);

    useEffect(() => {
        const fetchTrack = async () => {
            try {
                if (token) {
                    const data = await getTrackById(trackId, token);
                    setTrack(data);
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchTrack();
    }, [trackId, token]);

    return track;
}
