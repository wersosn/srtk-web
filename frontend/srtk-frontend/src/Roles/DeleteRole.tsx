import React, { useState } from 'react';
import deleteIcon from '../assets/delete.png';
import { useTranslation } from "react-i18next";

interface DeleteRoleProps {
    roleId: number;
    onDeleted: () => void;
}

const DeleteRole: React.FC<DeleteRoleProps> = ({ roleId, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleDelete = async () => {
        if (!window.confirm(t("role.deleteAlert"))) { 
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/roles/${roleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (response.ok) {
                onDeleted();
            } else {
                const text = await response.text();
                setError(`${t("universal.error")} ${text || t("role.deleteError")}`);
            }
        } catch (err: any) {
            setError(`${t("universal.error")} ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={handleDelete} disabled={loading} className="icon-button">
                <img src={deleteIcon} alt="Usuń" style={{ width: '16px', height: '16px' }}/>
            </button>
            {error && <div className="text-danger mt-1">{error}</div>}
        </>
    );
};

export default DeleteRole;
