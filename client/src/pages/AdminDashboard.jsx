import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { api } from '../api';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [stats, setStats] = useState(null);
    const [enterprises, setEnterprises] = useState([]);
    const [cases, setCases] = useState([]);
    const [news, setNews] = useState([]);
    const [newsForm, setNewsForm] = useState({ title: '', content: '', id: null });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('stats');

    useEffect(() => {
        if (user?.role === 'admin') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [statsData, enterprisesData, casesData, newsData] = await Promise.all([
                api.admin.getStats(),
                api.admin.getEnterprises(),
                api.admin.getCases(),
                api.admin.getNews()
            ]);
            setStats(statsData);
            setEnterprises(enterprisesData);
            setCases(casesData);
            setNews(newsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (id, status) => {
        try {
            await api.admin.moderateEnterprise(id, status);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleCaseStatus = async (id, status) => {
        try {
            await api.admin.changeCaseStatus(id, status);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить новость?')) return;
        try {
            await api.admin.deleteNews(id);
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleNewsFormChange = (e) => {
        const { name, value } = e.target;
        setNewsForm(prev => ({ ...prev, [name]: value }));
    };

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        const { title, content, id } = newsForm;
        if (!title || !content) {
            alert('Заполните все поля');
            return;
        }
        try {
            if (id) {
                await api.admin.updateNews(id, { title, content });
            } else {
                await api.admin.createNews({ title, content });
            }
            setNewsForm({ title: '', content: '', id: null });
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (authLoading) return <div className="loading">Загрузка...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/login" />;

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <>
            <Header />
            <main className="dashboard">
                <div className="container">
                    <h1>Админ-панель</h1>

                    <div className="tabs">
                        <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>Статистика</button>
                        <button className={activeTab === 'enterprises' ? 'active' : ''} onClick={() => setActiveTab('enterprises')}>Предприятия</button>
                        <button className={activeTab === 'cases' ? 'active' : ''} onClick={() => setActiveTab('cases')}>Кейсы</button>
                        <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>Новости</button>
                    </div>

                    {activeTab === 'stats' && stats && (
                        <div className="stats-section">
                            <div className="stats-grid">
                                <div className="stat-card card">
                                    <h3>Всего пользователей</h3>
                                    <span className="stat-number">{stats.totalUsers}</span>
                                </div>
                                <div className="stat-card card">
                                    <h3>Участников</h3>
                                    <span className="stat-number">{stats.totalParticipants}</span>
                                </div>
                                <div className="stat-card card">
                                    <h3>Предприятий</h3>
                                    <span className="stat-number">{stats.totalEnterprises}</span>
                                </div>
                                <div className="stat-card card">
                                    <h3>Кейсов</h3>
                                    <span className="stat-number">{stats.totalCases}</span>
                                </div>
                                <div className="stat-card card">
                                    <h3>Решений</h3>
                                    <span className="stat-number">{stats.totalSubmissions}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'enterprises' && (
                        <div className="section">
                            <h2>Модерация предприятий</h2>
                            <div className="items-list">
                                {enterprises.map(ent => (
                                    <div key={ent.id} className="item-card card">
                                        <div className="item-info">
                                            <h3>{ent.company_name}</h3>
                                            <p>{ent.region}</p>
                                            <p className="email">{ent.email}</p>
                                            <span className={`badge badge-${ent.moderation_status === 'approved' ? 'open' : ent.moderation_status === 'rejected' ? 'closed' : 'pending'}`}>
                                                {ent.moderation_status === 'approved' ? 'Одобрено' : ent.moderation_status === 'rejected' ? 'Отклонено' : 'На модерации'}
                                            </span>
                                        </div>
                                        {ent.moderation_status === 'pending' && (
                                            <div className="item-actions">
                                                <button onClick={() => handleModerate(ent.id, 'approved')} className="btn btn-primary">Одобрить</button>
                                                <button onClick={() => handleModerate(ent.id, 'rejected')} className="btn btn-secondary">Отклонить</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'cases' && (
                        <div className="section">
                            <h2>Управление кейсами</h2>
                            <div className="items-list">
                                {cases.map(c => (
                                    <div key={c.id} className="item-card card">
                                        <div className="item-info">
                                            <h3>{c.title}</h3>
                                            <p>{c.enterprise_name}</p>
                                            <span className={`badge badge-${c.status}`}>
                                                {c.status === 'open' ? 'Открыт' : 'Закрыт'}
                                            </span>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => handleCaseStatus(c.id, c.status === 'open' ? 'closed' : 'open')} className="btn btn-secondary">
                                                {c.status === 'open' ? 'Закрыть' : 'Открыть'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'news' && (
                        <div className="section">
                            <h2>Управление новостями</h2>
                            <form onSubmit={handleNewsSubmit} className="news-form card" style={{ padding: '16px', marginBottom: '24px' }}>
                                <input type="text" name="title" placeholder="Заголовок" value={newsForm.title} onChange={handleNewsFormChange} required style={{ width: '100%', marginBottom: '8px' }} />
                                <textarea name="content" placeholder="Содержание" value={newsForm.content} onChange={handleNewsFormChange} rows={3} required style={{ width: '100%', marginBottom: '8px' }} />
                                <button type="submit" className="btn btn-primary">{newsForm.id ? 'Обновить новость' : 'Создать новость'}</button>
                                {newsForm.id && (
                                    <button type="button" className="btn btn-secondary" style={{ marginLeft: '8px' }} onClick={() => setNewsForm({ title: '', content: '', id: null })}>Отменить</button>
                                )}
                            </form>
                            <div className="items-list">
                                {news.map(n => (
                                    <div key={n.id} className="item-card card">
                                        <div className="item-info">
                                            <h3>{n.title}</h3>
                                            <p>{new Date(n.published_at).toLocaleDateString('ru')}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button className="btn btn-primary" onClick={() => setNewsForm({ title: n.title, content: n.content, id: n.id })}>Редактировать</button>
                                            <button className="btn btn-secondary" onClick={() => handleDeleteNews(n.id)}>Удалить</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <style>{`
                .dashboard {
                    padding: 48px 0 80px;
                }
                .dashboard h1 {
                    margin-bottom: 32px;
                }
                .tabs {
                    display: flex;
                    gap: 4px;
                    border-bottom: 2px solid var(--border);
                    margin-bottom: 32px;
                }
                .tabs button {
                    padding: 12px 24px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                }
                .tabs button.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 24px;
                }
                .stat-card {
                    text-align: center;
                }
                .stat-card h3 {
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .stat-number {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary);
                }
                .section h2 {
                    margin-bottom: 24px;
                }
                .items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .item-card {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .item-info h3 {
                    margin-bottom: 4px;
                }
                .item-info p {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .item-info .email {
                    color: var(--primary);
                }
                .item-actions {
                    display: flex;
                    gap: 12px;
                }
                /* News form styling – reuse site variables */
                .news-form input,
                .news-form textarea {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    background: var(--white);
                    color: var(--text);
                    font-size: 14px;
                    margin-bottom: 8px;
                    transition: border-color 0.2s ease;
                }
                .news-form input:focus,
                .news-form textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                }
                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .item-card {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .item-actions {
                        margin-top: 16px;
                    }
                }
            `}</style>
        </>
    );
}