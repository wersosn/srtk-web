import React, { useState, type FormEvent } from "react";
import type { Status } from '../Types/Types';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

interface AddStatusProps {
    onAddStatus: (newStatus: Status) => void;
}

const AddStatus: React.FC<AddStatusProps> = ({ onAddStatus }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const { t } = useTranslation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const newStatus = { Name: name };
        try {
            const { data: createdStatus } = await api.post<Status>("/statuses", newStatus);
            setMessage(t("status.statusAdded"));
            setName("");
            onAddStatus(createdStatus);
        } catch (error: any) {
            setMessage(t("universal.error") + error.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="statusName">{t("status.name")}</label>
                    <input id="statusName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <button type="submit">{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddStatus;
