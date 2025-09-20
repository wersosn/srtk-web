import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';
import deleteIconLight from '../assets/delete-light.png';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import { usePrefersDark } from '../Hooks/usePrefersDark';

interface DeleteNotificationProps {
    notificationId: number;
    onDeleted: () => void;
}

const DeleteNotification: React.FC<DeleteNotificationProps> = ({ notificationId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const isDark = usePrefersDark();
    const icon = isDark ? deleteIconLight : deleteIcon;

    const handleDelete = async () => {
        if (!window.confirm(t("notification.deleteAlert"))) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.delete(`/notifications/${notificationId}`);
            onDeleted();
        } catch (err: any) {
            setError(`${t("universal.error")} ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleDelete} disabled={loading} className="icon-button" title={t("universal.delete")}>
                <img src={icon} alt="Usuń" style={{ width: '16px', height: '16px' }} />
            </button>
            {error && <div className="text-danger mt-1">{error}</div>}
        </>
    );
};

export default DeleteNotification;
