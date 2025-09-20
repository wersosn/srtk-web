import React, { useState, type FormEvent } from "react";
import type { Facility } from '../Types/Types';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";

interface AddFacilityProps {
    onAddFacility: (newFacility: Facility) => void;
}

const AddFacility: React.FC<AddFacilityProps> = ({ onAddFacility }) => {
    const [name, setName] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const { t } = useTranslation();
    const isFormValid = !!name && !!city && !!address;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const newFacility = { name, city, address };

        try {
            const { data: createdFacility } = await api.post<Facility>("/facilities", newFacility);
            setMessage(t("facility.facilityAdded"));
            setName("");
            setCity("");
            setAddress("");
            onAddFacility(createdFacility);
        } catch (error: any) {
            setMessage(t("universal.error") + error.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="facilityName">{t("facility.name")}</label>
                    <input id="facilityName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />

                    <label htmlFor="facilityCity">{t("facility.city")}</label>
                    <input id="facilityCity" value={city} onChange={e => setCity(e.target.value)} required maxLength={50} className="info-input" />

                    <label htmlFor="facilityAddress">{t("facility.address")}</label>
                    <input id="facilityAddress" value={address} onChange={e => setAddress(e.target.value)} required maxLength={50} className="info-input" />
                </div>
                <button type="submit" disabled={!isFormValid}>{t("universal.save")}</button>
                <div>{message}</div>
            </form>
        </>
    );
};

export default AddFacility;
