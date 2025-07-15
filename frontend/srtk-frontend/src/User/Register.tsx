import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [lastName, setLastName] = useState('');
    const [info, setInfo] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setInfo('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, lastName }),
            });

            if (!response.ok) {
                const msg = await response.text();
                throw new Error(msg);
            }

            setInfo('Rejestracja przebiegła pomyślnie');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setInfo(err.message || 'Błąd rejestracji');
        }
    };

    return (
        <div>
            <h2>Rejestracja</h2>
            <form onSubmit={handleRegister}>
                <input type="email" placeholder="Email" value={email}
                    onChange={(e) => setEmail(e.target.value)} required />
                <input type="name" placeholder="Imię" value={name}
                    onChange={(e) => setName(e.target.value)} required />
                <input type="lastName" placeholder="Nazwisko" value={lastName}
                    onChange={(e) => setLastName(e.target.value)} required />
                <input type="password" placeholder="Hasło" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Zarejestruj</button>
                {info && <p>{info}</p>}
            </form>
        </div>
    );
};

export default Register;
