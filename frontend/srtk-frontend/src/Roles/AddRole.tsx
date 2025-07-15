import React, { useState, type FormEvent } from "react";

const AddRole: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newRole = { name };

    try {
      const response = await fetch("/api/roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newRole)
      });

      if (response.ok) {
        setMessage("Dodano rolę");
        setName("");
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
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nazwa: </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          maxLength={100}
        />
      </div>
      <button type="submit">Dodaj nową rolę</button>
      <div>{message}</div>
    </form>
  );
};

export default AddRole;
