import React, { useState, useEffect } from 'react';
import type { Facility, Role, User } from '../Types/Types';
import { getAllFacilities, getAllRoles } from '../Services/Api';
import { useTranslation } from "react-i18next";
import { useAuth } from './AuthContext';
import api from "../Api/axios";

interface EditUserProps {
    userId: number;
    currentEmail: string;
    currentName: string;
    currentSurname: string;
    currentPhoneNumber: string;
    currentRoleId: number;
    currentFacilityId: number;
    onUpdated: (updatedUser: any) => void;
    onCancel: () => void;
}

const EditUser: React.FC<EditUserProps> = ({ userId, currentEmail, currentName, currentSurname, currentPhoneNumber, currentRoleId, currentFacilityId, onUpdated, onCancel }) => {
    const [email, setEmail] = useState(currentEmail);
    const [name, setName] = useState(currentName);
    const [surname, setSurname] = useState(currentSurname);
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
    const [roleId, setRoleId] = useState(currentRoleId);
    const { facilityId: authFacilityId } = useAuth();
    const [facilityId, setFacilityId] = useState(currentFacilityId);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [adminInFacility, setAdminInFacility] = useState<number | null>(null);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    useEffect(() => {
        if (token) {
            if (!isNaN(authFacilityId!)) {
                setAdminInFacility(authFacilityId);
                if (authFacilityId !== 0) {
                    setFacilityId(authFacilityId!);
                }
            }
        }

        const fetchFacilities = async () => {
            try {
                const data = await getAllFacilities(token!);
                setFacilities(data);
            } catch (err) {
                console.error(t("api.facilityError"));
            }
        };

        const fetchRoles = async () => {
            try {
                const data = await getAllRoles(token!);
                setRoles(data);
            } catch (err) {
                console.error(t("api.roleError"));
            }
        };
        fetchFacilities();
        fetchRoles();
    }, [token]);

    useEffect(() => {
        if (roleId === 2 && adminInFacility && adminInFacility !== 0) {
            setFacilityId(adminInFacility);
        }
    }, [roleId, adminInFacility]);

    const isFormValid = (() => {
        if (!email) {
            return false;
        }
        if (roleId === 1) {
            return !!name && !!surname;
        }
        if (roleId === 2) {
            return authFacilityId !== 0 ? true : !!facilityId;
        }
        return false;
    })();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const bodyData: any = { email, roleId, };

        if (roleId === 1) {
            bodyData.name = name;
            bodyData.surname = surname;
            bodyData.phoneNumber = phoneNumber;
        }
        else {
            bodyData.facilityId = facilityId;
        }

        try {
            const { data: updatedUser } = await api.put<User>(`/users/${userId}`, bodyData);
            onUpdated(updatedUser);
            setMessage('');
        } catch (err: any) {
            setMessage(t("universal.error") + err.message);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="userEmail">Email</label>
                    <input id="userEmail" value={email} onChange={e => setEmail(e.target.value)} required className="info-input" />

                    <label>{t("user.role")}</label>
                    <select id="roleSelect" value={roleId} onChange={(e) => setRoleId(Number(e.target.value))} className="info-input">
                        <option value="">{t("user.selectRole")}</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>

                    {roleId === 1 && (
                        <>
                            <div>
                                <label htmlFor="userName">{t("user.name")}</label>
                                <input id="userName" value={name} onChange={(e) => setName(e.target.value)} required className="info-input" />
                            </div>
                            <div>
                                <label htmlFor="userSurname">{t("user.surname")}</label>
                                <input id="userSurname" value={surname} onChange={(e) => setSurname(e.target.value)} required className="info-input" />
                            </div>
                            <div>
                                <label htmlFor="userPhone">{t("user.phoneNumber")}</label>
                                <input id="userPhone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="info-input" />
                            </div>
                        </>
                    )}

                    {roleId === 2 && (
                        authFacilityId === 0 ? (
                            <div>
                                <label>{t("user.facility")}</label>
                                <select id="facilitySelect" value={facilityId} onChange={(e) => setFacilityId(Number(e.target.value))} className="info-input">
                                    <option value="">{t("user.selectFacility")}</option>
                                    {facilities.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label>{t("user.facility")}</label>
                                <input id="facilitySet" type="text" className="info-input" disabled value={facilities.find(f => f.id === facilityId)?.name || 'Twój obiekt'} />
                            </div>
                        )
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" disabled={!isFormValid}>{t("universal.saveChanges")}</button>
                    <button type="button" onClick={onCancel}>{t("universal.cancel")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditUser;
