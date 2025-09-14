import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

interface DeleteRoleProps {
    roleId: number;
    onDeleted: () => void;
}

const DeleteRole: React.FC<DeleteRoleProps> = ({ roleId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { t } = useTranslation();

    const handleDelete = async () => {
        if (!window.confirm(t("role.deleteAlert"))) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.delete(`/roles/${roleId}`);
            onDeleted();
        } catch (err: any) {
            setError(`${t("universal.error")} ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleDelete} disabled={loading} className="icon-button">
                <img src={deleteIcon} alt="Usuń" style={{ width: '16px', height: '16px' }} />
            </button>
            {error && <div className="text-danger mt-1">{error}</div>}
        </>
    );
};

export default DeleteRole;
