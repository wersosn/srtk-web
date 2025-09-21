import { useState, useEffect } from "react";

export function useIsMobile(query = "(max-width: 768px)") {
    const [isMobile, setIsMobile] = useState(window.matchMedia(query).matches);

    useEffect(() => {
        const media = window.matchMedia(query);
        const listener = () => setIsMobile(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return isMobile;
}
