import { useState } from "react";
import type { Track } from "../Types/Types";

export function useFilteredTracks(tracks: Track[]) {
    const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);

    const applyFilter = (facilityId?: number) => {
        let result = tracks;
        if (facilityId) {
            result = result.filter(t => t.facilityId === facilityId);
        }
        setFilteredTracks(result);
    };

    return { filteredTracks, setFilteredTracks, applyFilter};
}