import type { Status, Track } from "../Types/Types";

export const getTrackName = (tracks: Track[], trackId: number, t: any) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : t("api.unknownTrack");
};

export const getStatusName = (statuses: Status[], statusId: number, t: any) => {
    const status = statuses.find(t => t.id === statusId);
    return status ? status.name : t("api.unknownStatus");
};