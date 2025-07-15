import React, { useState, type FormEvent } from "react";

const AddFacility: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const newFacility = { name, city, address };

    try {
      const response = await fetch("/api/facilities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newFacility)
      });

      if (response.ok) {
        setMessage("Dodano obiekt");
        setName("");
        setCity("");
        setAddress("");
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
      <div>
        <label>Miasto: </label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          required
          maxLength={50}
        />
      </div>
      <div>
        <label>Ulica: </label>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
          maxLength={50}
        />
      </div>
      <button type="submit">Dodaj nowy obiekt</button>
      <div>{message}</div>
    </form>
  );
};

export default AddFacility;
