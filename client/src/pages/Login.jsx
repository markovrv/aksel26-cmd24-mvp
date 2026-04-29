import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <h1>Вход</h1>
                <p className="auth-subtitle">Войдите в свой аккаунт</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label>Пароль</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <p className="auth-footer">
                    Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
            </div>

            <style>{`
                .auth-page {
                    min-height: calc(100vh - 72px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                }
                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    padding: 48px;
                }
                .auth-card h1 {
                    margin-bottom: 8px;
                }
                .auth-subtitle {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                }
                .error-message {
                    background: #FEE2E2;
                    color: #C62828;
                    padding: 12px 16px;
                    border-radius: var(--radius);
                    margin-bottom: 24px;
                    font-size: 14px;
                }
                .auth-footer {
                    text-align: center;
                    margin-top: 24px;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}