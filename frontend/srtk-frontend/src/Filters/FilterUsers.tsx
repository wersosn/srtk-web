import { useState } from 'react';
import { useTranslation } from "react-i18next";
import type { Client, Admin } from '../Types/Types';
import { useRoles } from '../Hooks/useRoles';

interface FilterUsersProps {
    clients: Client[];
    admins: Admin[];
    onFilterChange: (roleId?: number) => void;
}

const FilterUsers: React.FC<FilterUsersProps> = ({ onFilterChange }) => {
    const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
    const token = localStorage.getItem('token');
    const { t } = useTranslation();
    const { roles } = useRoles(token);

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