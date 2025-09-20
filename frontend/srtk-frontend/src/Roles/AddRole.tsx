import React, { useState, type FormEvent } from "react";
import type { Role } from '../Types/Types';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

interface AddRoleProps {
    onAddRole: (newRole: Role) => void;
}

const AddRole: React.FC<AddRoleProps> = ({ onAddRole }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const { t } = useTranslation();
    const isFormValid = !!name;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const newRole = { Name: name };
        try {
            const { data: createdRole } = await api.post<Role>("/roles", newRole);
            setMessage(t("role.roleAdded"));
            setName("");
            onAddRole(createdRole);
        } catch (error: any) {
            setMessage(t("universal.error") + error.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="roleName">{t("role.name")}</label>
                    <input id="roleName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <button type="submit" disabled={!isFormValid}>{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddRole;
