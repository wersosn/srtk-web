import { useEffect, useState, useCallback } from "react";
import { getUserPreferences } from "../Api/Api";

export function useUserPreferences(userId: number | undefined, token: string | null, t: any) {
    const [elementsPerPage, setElementsPerPage] = useState<number>(0);

    const fetchUserPreferences = useCallback(async () => {
        if (!userId || !token) return;

        try {
            const data = await await getUserPreferences(userId, token);
            setElementsPerPage(data.elementsPerPage);
        } catch (err: any) {
            console.log(err.message || t("universal.error"));
        }
    }, [userId, token]);

    useEffect(() => {
        fetchUserPreferences();
    }, [fetchUserPreferences]);

    return { elementsPerPage, setElementsPerPage, refreshPreferences: fetchUserPreferences};
}
