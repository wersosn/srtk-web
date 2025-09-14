import React, { useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../Api/axios";
import type { User } from '../Types/Types';

interface EditMyInfoProps {
    userId: number;
    currentEmail: string;
    currentName: string;
    currentSurname: string;
    currentPhoneNumber: string;
    onUpdated: (updatedUser: any) => void;
}

const EditMyInfo: React.FC<EditMyInfoProps> = ({ userId, currentEmail, currentName, currentSurname, currentPhoneNumber, onUpdated }) => {
    const [email, setEmail] = useState(currentEmail);
    const [name, setName] = useState(currentName);
    const [surname, setSurname] = useState(currentSurname);
    const [phoneNumber, setPhoneNumber] = useState(currentPhoneNumber);
    const [message, setMessage] = useState('');
    const token = localStorage.getItem('token');
    const { t } = useTranslation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setMessage(t("profile.noToken"));
            return;
        }

        const bodyData: any = { email, name, surname, phoneNumber };

        try {
            const { data: updatedUser } = await api.put<User>(`/users/clients/${userId}`, bodyData);
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
                </div>

                <div className="d-flex gap-2">
                    <button type="submit">{t("profile.saveChanges")}</button>
                </div>
                <div>{message}</div>
            </form>
        </>
    );
};

export default EditMyInfo;
