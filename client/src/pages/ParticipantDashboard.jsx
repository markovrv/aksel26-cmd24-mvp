import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { api } from '../api';

export default function ParticipantDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});

    useEffect(() => {
        if (user?.role === 'participant') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [profileData, submissionsData] = await Promise.all([
                api.participant.getProfile(),
                api.participant.getSubmissions()
            ]);
            setProfile(profileData);
            setForm(profileData);
            setSubmissions(submissionsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.participant.updateProfile(form);
            setEditMode(false);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (authLoading) return <div className="loading">Загрузка...</div>;
    if (!user || user.role !== 'participant') return <Navigate to="/login" />;

    const categoryLabels = {
        school_8_9: 'Школьники 8–9 класс',
        school_10_11: 'Школьники 10–11 класс',
        spo: 'СПО / Колледж',
        university: 'Студенты ВУЗ'
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <>
            <Header />
            <main className="dashboard">
                <div className="container">
                    <h1>Личный кабинет участника</h1>

                    <div className="dashboard-grid">
                        <section className="profile-section card">
                            <div className="section-header">
                                <h2>Профиль</h2>
                                {!editMode && <button onClick={() => setEditMode(true)} className="btn btn-secondary">Редактировать</button>}
                                {editMode && (
                                    <div className="edit-buttons">
                                        <button onClick={handleSave} className="btn btn-primary">Сохранить</button>
                                        <button onClick={() => { setEditMode(false); setForm(profile); }} className="btn btn-secondary">Отмена</button>
                                    </div>
                                )}
                            </div>

                            {editMode ? (
                                <div className="profile-form">
                                    <div className="input-group">
                                        <label>ФИО</label>
                                        <input type="text" value={form.full_name || ''} onChange={e => setForm({ ...form, fullName: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Учебное заведение</label>
                                        <input type="text" value={form.education_org || ''} onChange={e => setForm({ ...form, educationOrg: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Регион</label>
                                        <input type="text" value={form.region || ''} onChange={e => setForm({ ...form, region: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label>Категория</label>
                                        <select value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            <option value="school_8_9">Школьники 8–9 класс</option>
                                            <option value="school_10_11">Школьники 10–11 класс</option>
                                            <option value="spo">СПО / Колледж</option>
                                            <option value="university">Студенты ВУЗ</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                <div className="profile-info">
                                    <div className="info-row">
                                        <span className="label">ФИО:</span>
                                        <span className="value">{profile?.full_name}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Email:</span>
                                        <span className="value">{user.email}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Учебное заведение:</span>
                                        <span className="value">{profile?.education_org || '—'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Категория:</span>
                                        <span className="value">{categoryLabels[profile?.category] || '—'}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Регион:</span>
                                        <span className="value">{profile?.region || '—'}</span>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="stats-section card">
                            <h2>Статистика</h2>
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <span className="stat-number">{submissions.length}</span>
                                    <span className="stat-label">Отправлено решений</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">{submissions.filter(s => s.status === 'reviewed').length}</span>
                                    <span className="stat-label">Оценено</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">{submissions.reduce((sum, s) => sum + (s.total_score || 0), 0)}</span>
                                    <span className="stat-label">Баллы</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section className="submissions-section card">
                        <h2>Мои решения</h2>
                        {submissions.length === 0 ? (
                            <div className="empty-state">
                                <p>У вас пока нет отправленных решений</p>
                                <Link to="/cases" className="btn btn-primary">Выбрать кейс</Link>
                            </div>
                        ) : (
                            <div className="submissions-list">
                                {submissions.map(sub => (
                                    <div key={sub.id} className="submission-item">
                                        <div className="submission-main">
                                            <h3>{sub.case_title}</h3>
                                            <p className="submission-text">{sub.text_answer?.substring(0, 150)}...</p>
                                            <span className="submission-date">
                                                Отправлено: {new Date(sub.submitted_at).toLocaleDateString('ru')}
                                            </span>
                                        </div>
                                        <div className="submission-status">
                                            <span className={`badge badge-${sub.status === 'reviewed' ? 'open' : sub.status === 'under_review' ? 'pending' : 'closed'}`}>
                                                {sub.status === 'submitted' ? 'Отправлено' : sub.status === 'under_review' ? 'На проверке' : 'Проверено'}
                                            </span>
                                            {sub.total_score && <span className="score">{sub.total_score} баллов</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <style>{`
                .dashboard {
                    padding: 48px 0 80px;
                }
                .dashboard h1 {
                    margin-bottom: 32px;
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .section-header h2 {
                    margin: 0;
                }
                .edit-buttons {
                    display: flex;
                    gap: 12px;
                }
                .profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .info-row {
                    display: flex;
                    gap: 16px;
                }
                .info-row .label {
                    color: var(--text-secondary);
                    min-width: 150px;
                }
                .info-row .value {
                    font-weight: 500;
                }
                .profile-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .stats-section h2 {
                    margin-bottom: 24px;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                .stat-box {
                    text-align: center;
                    padding: 24px;
                    background: var(--background);
                    border-radius: var(--radius);
                }
                .stat-number {
                    display: block;
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary);
                }
                .stat-label {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .submissions-section h2 {
                    margin-bottom: 24px;
                }
                .submissions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .submission-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 24px;
                    background: var(--background);
                    border-radius: var(--radius);
                }
                .submission-main h3 {
                    margin-bottom: 8px;
                }
                .submission-text {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .submission-date {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                .submission-status {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 8px;
                }
                .score {
                    font-weight: 600;
                    color: var(--primary);
                }
                @media (max-width: 1024px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
            `}</style>
        </>
    );
}