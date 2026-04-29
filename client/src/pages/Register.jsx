import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CATEGORIES = [
    { value: 'school_8_9', label: 'Школьники 8–9 класс' },
    { value: 'school_10_11', label: 'Школьники 10–11 класс' },
    { value: 'spo', label: 'СПО / Колледж' },
    { value: 'university', label: 'Студенты ВУЗ' }
];

export default function Register() {
    const [role, setRole] = useState('');
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        consentPersonalData: false,
        fullName: '',
        educationOrg: '',
        category: '',
        region: '',
        contactConsent: false,
        companyName: '',
        companyRegion: '',
        description: '',
        contactPerson: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);

        try {
            await register({
                role,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                consentPersonalData: form.consentPersonalData ? 'true' : '',
                fullName: form.fullName,
                educationOrg: form.educationOrg,
                category: form.category,
                region: form.region,
                contactConsent: form.contactConsent,
                companyName: form.companyName,
                companyRegion: form.companyRegion,
                description: form.description,
                contactPerson: form.contactPerson
            });
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
                <h1>Регистрация</h1>
                <p className="auth-subtitle">Создайте свой аккаунт</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="role-selector">
                        <button type="button" className={`role-btn ${role === 'participant' ? 'active' : ''}`}
                            onClick={() => setRole('participant')}>
                            Участник
                        </button>
                        <button type="button" className={`role-btn ${role === 'enterprise' ? 'active' : ''}`}
                            onClick={() => setRole('enterprise')}>
                            Предприятие
                        </button>
                    </div>

                    {role && (
                        <>

                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label>Пароль (минимум 8 символов)</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                            </div>

                            <div className="input-group">
                                <label>Подтверждение пароля</label>
                                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required />
                            </div>

                            <div className="checkbox-group">
                                <input type="checkbox" name="consentPersonalData" checked={form.consentPersonalData} onChange={handleChange} required />
                                <label>Я согласен на обработку персональных данных</label>
                            </div>

                        </>
                    )}

                    {role === 'participant' && (
                        <>
                            <div className="input-group">
                                <label>ФИО</label>
                                <input type="text" name="fullName" value={form.fullName} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label>Учебное заведение</label>
                                <input type="text" name="educationOrg" value={form.educationOrg} onChange={handleChange} />
                            </div>

                            <div className="input-group">
                                <label>Категория</label>
                                <select name="category" value={form.category} onChange={handleChange} required>
                                    <option value="">Выберите категорию</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="input-group">
                                <label>Регион</label>
                                <input type="text" name="region" value={form.region} onChange={handleChange} />
                            </div>

                            <div className="checkbox-group">
                                <input type="checkbox" name="contactConsent" checked={form.contactConsent} onChange={handleChange} />
                                <label>Я согласен на передачу моих контактных данных предприятиям</label>
                            </div>
                        </>
                    )}

                    {role === 'enterprise' && (
                        <>
                            <div className="input-group">
                                <label>Название компании</label>
                                <input type="text" name="companyName" value={form.companyName} onChange={handleChange} required />
                            </div>

                            <div className="input-group">
                                <label>Регион</label>
                                <input type="text" name="companyRegion" value={form.companyRegion} onChange={handleChange} />
                            </div>

                            <div className="input-group">
                                <label>Описание</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
                            </div>

                            <div className="input-group">
                                <label>Контактное лицо</label>
                                <input type="text" name="contactPerson" value={form.contactPerson} onChange={handleChange} />
                            </div>
                        </>
                    )}

                    {role && (
                        <>

                            <button type="submit" className="btn btn-primary" disabled={loading || !role} style={{ width: '100%' }}>
                                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>

                        </>
                    )}
                </form>

                <p className="auth-footer">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
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
                    max-width: 480px;
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
                .role-selector {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 24px;
                }
                .role-btn {
                    flex: 1;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    background: #ffffff;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    font-size: 15px;
                    color: #6b7280;
                    position: relative;
                    overflow: hidden;
                }
                .role-btn:hover {
                    border-color: #2563eb;
                    color: #2563eb;
                    background: #eff6ff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
                }
                .role-btn.active {
                    border-color: #2563eb;
                    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
                    color: #ffffff;
                    transform: translateY(0);
                    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
                }
                .role-btn.active::before {
                    content: '✓';
                    position: absolute;
                    top: 6px;
                    right: 8px;
                    font-size: 12px;
                    opacity: 0.9;
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