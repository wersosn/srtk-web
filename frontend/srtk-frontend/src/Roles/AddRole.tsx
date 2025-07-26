import React, { useState, type FormEvent } from "react";

type Role = {
  id: number;
  name: string;
};

interface AddRoleProps {
  onAddRole: (newRole: Role) => void;
}

const AddRole: React.FC<AddRoleProps> = ({ onAddRole }) => {
    const [name, setName] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');

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
                setMessage("Dodano rolę");
                setName("");
                onAddRole(createdRole);
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
                  <label>Nazwa</label>
                  <input value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
              </div>
              <button type="submit">Dodaj nową rolę</button>
              <div>{message}</div>
          </form>
      </>
    );
};

export default AddRole;
