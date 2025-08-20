import React, { useState, type FormEvent } from "react";
import type { Role } from '../Types/Types';
import { useTranslation } from "react-i18next";

interface AddRoleProps {
  onAddRole: (newRole: Role) => void;
}

const AddRole: React.FC<AddRoleProps> = ({ onAddRole }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const newRole = { Name: name };
        try {
            const response = await fetch("/api/roles", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newRole)
            });

            if (response.ok) {
                const createdRole: Role = await response.json();
                setMessage(t("role.roleAdded"));
                setName("");
                onAddRole(createdRole);
            } else {
                let errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    setMessage(t("universal.error") + (errorData.detail || JSON.stringify(errorData)));
                } catch {
                    setMessage(t("universal.error") + (errorText));
                }
            }
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
              <button type="submit">{t("universal.save")}</button>
              <div>{message}</div>
          </form>
      </>
    );
};

export default AddRole;
