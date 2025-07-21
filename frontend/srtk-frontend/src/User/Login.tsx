import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../User/AuthContext';
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg);
      }

      const data = await response.json();
      login(data.token);
      setInfo('Zalogowano pomyślnie');
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Błąd logowania');
    }
  };

  const handleCheckboxChange = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Logowanie</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />

        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleCheckboxChange}
              style={{ marginRight: '5px' }}
            />
            Zapamiętaj mnie
          </label>

          <a href="/forgot-password" style={{ fontSize: '0.9rem', color: '#101d26' }}>
            Zapomniałeś/aś hasła?
          </a>
        </div>
        <br />
        <button type="submit">
          Zaloguj się
        </button>
        {info && <p className="login-info">{info}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <hr />
        <a href="/register" style={{ fontSize: '0.9rem', color: '#101d26' }}>
          Nie masz jeszcze konta? Zarejestruj się
        </a>
      </form>
    </div>
  );
};

export default Login;
