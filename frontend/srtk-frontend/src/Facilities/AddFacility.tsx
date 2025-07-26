import React, { useState, type FormEvent } from "react";

type Facility = {
    id: number;
    name: string;
    city: string;
    address: string;
};

interface AddFacilityProps {
  onAddFacility: (newFacility: Facility) => void;
}

const AddFacility: React.FC<AddFacilityProps> = ({ onAddFacility }) => {
    const [name, setName] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const newFacility = { name, city, address };

        try {
            const response = await fetch("/api/facilities", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(newFacility)
          });

          if (response.ok) {
              const createdFacility: Facility = await response.json();
              setMessage("Dodano obiekt");
              setName("");
              setCity("");
              setAddress("");
              onAddFacility(createdFacility);
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

                  <label>Miasto</label>
                  <input value={name} onChange={e => setCity(e.target.value)} required maxLength={50} className="info-input" />

                  <label>Adres</label>
                  <input value={name} onChange={e => setAddress(e.target.value)} required maxLength={50} className="info-input" />
              </div>
              <button type="submit">Dodaj nowy obiekt</button>
              <div>{message}</div>
          </form>
      </>
  );
};

export default AddFacility;
