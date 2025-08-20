import React, { useState, type FormEvent } from "react";
import type { Status } from '../Types/Types';
import { useTranslation } from "react-i18next";

interface AddStatusProps {
  onAddStatus: (newStatus: Status) => void;
}

const AddStatus: React.FC<AddStatusProps> = ({ onAddStatus }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const newStatus = { Name: name };
        try {
            const response = await fetch("/api/statuses", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newStatus)
            });

            if (response.ok) {
                const createdStatus: Status = await response.json();
                setMessage(t("status.statusAdded"));
                setName("");
                onAddStatus(createdStatus);
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
