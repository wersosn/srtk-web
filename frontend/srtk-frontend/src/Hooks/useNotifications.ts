export function useNotifications(token: string | null, userId: number | undefined, t: any) {
    const addNotification = async (title: string, description: string, language: string) => {
        if (!userId) return;

        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    Title: title,
                    Description: description,
                    TimeStamp: new Date().toISOString(),
                    IsRead: false,
                    Language: language,
                    UserId: userId
                }),
            });

            if (!res.ok) {
                throw new Error(t("notification.notificationAddError"));
            }
        } catch (err) {
            console.error(err);
        }
    };
    return { addNotification };
}