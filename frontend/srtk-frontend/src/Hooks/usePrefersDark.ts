import { useState, useEffect } from "react";

export const usePrefersDark = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        setIsDark(mq.matches);

        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return isDark;
};
