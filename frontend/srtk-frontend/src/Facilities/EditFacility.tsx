import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import type { Facility } from '../Types/Types';

interface EditFacilityProps {
    facilityId: number;
    currentName: string;
    currentCity: string;
    currentAddress: string;
    onUpdated: (updatedFacility: { id: number; name: string; city: string; address: string }) => void;
    onCancel: () => void;
}

const EditFacility: React.FC<EditFacilityProps> = ({ facilityId, currentName, currentCity, currentAddress, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [city, setCity] = useState(currentCity);
    const [address, setAddress] = useState(currentAddress);
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: updatedFacility } = await api.put<Facility>(`/facilities/${facilityId}`, { name, city, address });
            onUpdated(updatedFacility);
            setMessage('');
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="facilityName">{t("facility.name")}</label>
                    <input id="facilityName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div>
                    <label htmlFor="facilityCity">{t("facility.city")}</label>
                    <input id="facilityCity" value={city} onChange={e => setCity(e.target.value)} required maxLength={50} className="info-input" />
                </div>
                <div>
                    <label htmlFor="facilityAddress">{t("facility.address")}</label>
                    <input id="facilityAddress" value={address} onChange={e => setAddress(e.target.value)} required maxLength={50} className="info-input" />
                </div>
                <div className="d-flex gap-2">
                    <button type="submit">{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditFacility;
