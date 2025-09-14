import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import type { Role } from '../Types/Types';

interface EditRoleProps {
    roleId: number;
    currentName: string;
    onUpdated: (updatedRole: { id: number; name: string }) => void;
    onCancel: () => void;
}

const EditRole: React.FC<EditRoleProps> = ({ roleId, currentName, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: updatedRole } = await api.put<Role>(`/roles/${roleId}`, { name });
            onUpdated(updatedRole);
            setMessage('');
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="roleName">{t("role.name")}</label>
                    <input id="roleName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditRole;
