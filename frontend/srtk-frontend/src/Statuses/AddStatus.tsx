import React, { useState, type FormEvent } from "react";

type Status = {
  id: number;
  name: string;
};

interface AddStatusProps {
  onAddStatus: (newStatus: Status) => void;
}

const AddStatus: React.FC<AddStatusProps> = ({ onAddStatus }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');

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
                setMessage("Dodano status");
                setName("");
                onAddStatus(createdStatus);
            } else {
                let errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    setMessage("Error: " + (errorData.detail || JSON.stringify(errorData)));
                } catch {
                    setMessage("Error: " + (errorText || "Wystąpił błąd"));
                }
            }
        } catch (error: any) {
            setMessage("Error: " + error.message);
        }
      };

    return (
      <>
          <form onSubmit={handleSubmit}>
              <div>
                  <label htmlFor="statusName">Nazwa</label>
                  <input id="statusName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
              </div>
              <button type="submit">Dodaj nowy status</button>
              <div>{message}</div>
          </form>
      </>
    );
};

export default AddStatus;
