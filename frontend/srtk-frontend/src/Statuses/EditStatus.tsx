import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import type { Status } from '../Types/Types';

interface EditStatusProps {
    statusId: number;
    currentName: string;
    onUpdated: (updatedStatus: { id: number; name: string }) => void;
    onCancel: () => void;
}

const EditStatus: React.FC<EditStatusProps> = ({ statusId, currentName, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [message, setMessage] = useState('');
    const { t } = useTranslation();
    const isFormValid = !!name;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: updatedStatus } = await api.put<Status>(`/statuses/${statusId}`, { name });
            onUpdated(updatedStatus);
            setMessage('');
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
                    <button type="submit" disabled={!isFormValid}>{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditStatus;
