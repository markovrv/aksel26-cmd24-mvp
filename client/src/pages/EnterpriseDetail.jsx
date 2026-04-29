import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

export default function EnterpriseDetail() {
    const { id } = useParams();
    const [enterprise, setEnterprise] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEnterprise();
    }, [id]);

    const loadEnterprise = async () => {
        try {
            const data = await api.enterprises.get(id);
            setEnterprise(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="loading">Загрузка...</div>
            </MainLayout>
        );
    }

    if (!enterprise) {
        return (
            <MainLayout>
                <div className="empty-state">
                    <h3>Предприятие не найдено</h3>
                    <Link to="/enterprises" className="btn btn-secondary">Вернуться к списку</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container">
                <div className="enterprise-detail">
                    <div className="enterprise-header">
                        <div className="enterprise-logo">{enterprise.company_name.charAt(0)}</div>
                        <div className="enterprise-info">
                            <h1>{enterprise.company_name}</h1>
                            <p className="enterprise-region">{enterprise.region}</p>
                            <p className="enterprise-desc">{enterprise.description}</p>
                            {enterprise.contact_person && (
                                <p className="contact-person">Контактное лицо: {enterprise.contact_person}</p>
                            )}
                        </div>
                    </div>

                    <div className="cases-section">
                        <h2>Доступные кейсы ({enterprise.cases?.filter(c => c.status === 'open').length || 0})</h2>
                        {enterprise.cases?.length > 0 ? (
                            <div className="cases-grid">
                                {enterprise.cases.filter(c => c.status === 'open').map(c => (
                                    <Link to={`/cases/${c.id}`} key={c.id} className="case-card card">
                                        <h3>{c.title}</h3>
                                        <p>{c.short_description}</p>
                                        <div className="case-footer">
                                            <span>Дедлайн: {new Date(c.deadline).toLocaleDateString('ru')}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>На данный момент нет открытых кейсов</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .enterprise-detail {
                    padding: 48px 0 80px;
                }
                .enterprise-header {
                    display: flex;
                    gap: 32px;
                    margin-bottom: 48px;
                    padding-bottom: 48px;
                    border-bottom: 1px solid var(--border);
                }
                .enterprise-logo {
                    width: 120px;
                    height: 120px;
                    background: var(--cat-1);
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 48px;
                    font-weight: 700;
                    color: var(--primary);
                    flex-shrink: 0;
                }
                .enterprise-info h1 {
                    margin-bottom: 8px;
                }
                .enterprise-region {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }
                .enterprise-desc {
                    margin-bottom: 16px;
                    line-height: 1.7;
                }
                .contact-person {
                    font-weight: 500;
                    color: var(--primary);
                }
                .cases-section h2 {
                    margin-bottom: 24px;
                }
                .cases-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                .case-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text-main);
                }
                .case-card:hover {
                    text-decoration: none;
                }
                .case-card h3 {
                    margin-bottom: 8px;
                }
                .case-card p {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 16px;
                }
                .case-footer {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                @media (max-width: 768px) {
                    .enterprise-header {
                        flex-direction: column;
                    }
                    .cases-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}