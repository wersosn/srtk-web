import React, { useState } from 'react';
import { useTranslation } from "react-i18next";

interface EditStatusProps {
    statusId: number;
    currentName: string;
    onUpdated: (updatedStatus: { id: number; name: string }) => void;
    onCancel: () => void;
}

const EditStatus: React.FC<EditStatusProps> = ({ statusId, currentName, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/statuses/${statusId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });
            if (response.ok) {
                const updatedStatus = await response.json();
                onUpdated(updatedStatus);
                setMessage('');
            } else {
                const error = await response.text();
                setMessage(t("universal.error") + error);
            }
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="statusName">{t("status.name")}</label>
                    <input id="statusName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">Z{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditStatus;
