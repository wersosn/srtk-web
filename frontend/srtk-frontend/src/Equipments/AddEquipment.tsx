import React, { useState, useEffect, type FormEvent } from "react";
import { jwtDecode } from 'jwt-decode';
import type { Equipment, Facility } from '../Types/Types';
import { useTranslation } from "react-i18next";

interface AddEquipmentProps {
    onAddEquipment: (newEquipment: Equipment) => void;
}

const AddEquipment: React.FC<AddEquipmentProps> = ({ onAddEquipment }) => {
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("");
    const [cost, setCost] = useState<number | "">("");
    const [facilityID, setFacilityId] = useState<number | "">("");
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [message, setMessage] = useState<string>("");
    const token = localStorage.getItem('token');
    const [adminInFacility, setAdminInFacility] = useState<number | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (token) {
            const decoded: any = jwtDecode(token);
            const id = parseInt(decoded.FacilityId);
            if (!isNaN(id)) {
                setAdminInFacility(id);
                if (id !== 0) {
                    setFacilityId(id);
                }
            }
        }

        const fetchFacilities = async () => {
            try {
                const res = await fetch('/api/facilities', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                if (!res.ok) throw new Error(t("api.facilityError"));
                const data = await res.json();
                setFacilities(data);
            } catch (err: any) {
                setMessage(err.message || t("api.facilityError"));
            }
        };
        fetchFacilities();
    }, [token]);


    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const newEquipment = { name, type, cost, facilityId: facilityID };

        try {
            const response = await fetch("/api/equipments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newEquipment)
            });

            if (response.ok) {
                const createdEquipment: Equipment = await response.json();
                setMessage(t("eq.eqAdded"));
                setName("");
                setType("");
                setCost(0);
                setFacilityId("");
                onAddEquipment(createdEquipment);
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
                    {adminInFacility === 0 && (
                        <>
                            <label>{t("eq.facility")}</label><br />
                            <select id="facilitySelect" value={facilityID} onChange={e => setFacilityId(Number(e.target.value))} required className="info-input">
                                <option value="">{t("eq.selectFacility")}</option>
                                {facilities.map(facility => (
                                    <option key={facility.id} value={facility.id}>
                                        {facility.name}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <label htmlFor="eqName">{t("eq.name")}</label>
                    <input id="eqName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />

                    <label htmlFor="eqType">{t("eq.name")}</label>
                    <input id="eqType" value={type} onChange={e => setType(e.target.value)} required className="info-input" />

                    <label htmlFor="eqCost">{t("eq.cost")}</label>
                    <input id="eqCost" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} className="info-input" />
                </div>
                <button type="submit">{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddEquipment;