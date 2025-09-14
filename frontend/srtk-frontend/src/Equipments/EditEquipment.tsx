import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import type { Equipment } from '../Types/Types';

interface EditEquipmentProps {
    equipmentId: number;
    currentName: string;
    currentType: string;
    currentCost: number;
    currentFacilityId: number;
    onUpdated: (updatedEquipment: { id: number; name: string; type: string; cost: number; facilityId: number }) => void;
    onCancel: () => void;
}

const EditEquipment: React.FC<EditEquipmentProps> = ({ equipmentId, currentName, currentType, currentCost, currentFacilityId, onUpdated, onCancel }) => {
    const [name, setName] = useState(currentName);
    const [type, setType] = useState(currentType);
    const [cost, setCost] = useState(currentCost);
    const facilityId = currentFacilityId;
    const [message, setMessage] = useState('');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const { data: updatedEquipment } = await api.put<Equipment>(`/equipments/${equipmentId}`, { name, type, cost, facilityId });
            onUpdated(updatedEquipment);
            setMessage('');
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="eqName">{t("eq.name")}</label>
                    <input id="eqName" value={name} onChange={e => setName(e.target.value)} required maxLength={100} className="info-input" />
                </div>
                <div>
                    <label htmlFor="eqType">{t("eq.type")}</label>
                    <input id="eqType" value={type} onChange={e => setType(e.target.value)} required className="info-input" />
                </div>
                <div>
                    <label htmlFor="eqCost">{t("eq.cost")}</label>
                    <input id="eqCost" value={cost} onChange={e => setCost(Number(e.target.value))} className="info-input" />
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

export default EditEquipment;
