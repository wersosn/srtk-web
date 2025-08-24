import { useState, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import type { Client, Admin, Role } from '../Types/Types';

interface FilterUsersProps {
    clients: Client[];
    admins: Admin[];
    onFilterChange: (roleId?: number) => void;
}

const FilterUsers: React.FC<FilterUsersProps> = ({ onFilterChange }) => {
    const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    // Pobieranie wszystkich ról z bazy:
    const fetchRoles = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/roles', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) {
                throw new Error(t("api.roleError"));
            }
            const data = await res.json();
            setRoles(data);
        } catch (err: any) {
            setError(err.message || t("universal.error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Filtr torów po obiekcie:
    const handleRoleChange = (value: string) => {
        const id = value ? Number(value) : undefined;
        setSelectedRoleId(id);
        onFilterChange(id);
    };

    // Reset filtrów:
    const handleReset = () => {
        setSelectedRoleId(undefined);
        onFilterChange(undefined);
    }

    return (
        <>
            <div className="d-flex align-items-center gap-1">
                <select value={selectedRoleId ?? ""} onChange={(e) => handleRoleChange(e.target.value)} className="info-input">
                    <option value="">{t("filters.allUsers")}</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
                <button onClick={handleReset} className="btn-filter">{t("filters.reset")}</button>
            </div>
        </>
    )
}

export default FilterUsers;