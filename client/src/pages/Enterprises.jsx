import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

export default function Enterprises() {
    const [enterprises, setEnterprises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('');

    useEffect(() => {
        loadEnterprises();
    }, []);

    const loadEnterprises = async () => {
        try {
            const data = await api.enterprises.list();
            setEnterprises(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = enterprises.filter(e =>
        e.company_name.toLowerCase().includes(search.toLowerCase()) &&
        (!region || e.region?.toLowerCase().includes(region.toLowerCase()))
    );

    return (
        <MainLayout>
            <div className="container">
                <div className="page-header">
                    <h1>Предприятия</h1>
                    <p>Выберите предприятие и узнайте о доступных кейсах</p>
                </div>

                <div className="filters">
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <input
                        type="text"
                        placeholder="Фильтр по региону..."
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                        className="search-input"
                    />
                </div>

                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : (
                    <div className="enterprises-grid">
                        {filtered.map(ent => (
                            <Link to={`/enterprises/${ent.id}`} key={ent.id} className="enterprise-card card">
                                <div className="enterprise-logo">
                                    {ent.company_name.charAt(0)}
                                </div>
                                <h3>{ent.company_name}</h3>
                                <p className="enterprise-region">{ent.region}</p>
                                <p className="enterprise-desc">{ent.description}</p>
                                <div className="enterprise-footer">
                                    <span className="cases-count">{ent.active_cases} активных кейсов</span>
                                    <span className="view-cases">Смотреть кейсы →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .filters {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .search-input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 16px;
                    max-width: 300px;
                }
                .enterprises-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding-bottom: 80px;
                }
                .enterprise-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text-main);
                }
                .enterprise-card:hover {
                    text-decoration: none;
                }
                .enterprise-logo {
                    width: 64px;
                    height: 64px;
                    background: var(--cat-1);
                    border-radius: var(--radius);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary);
                    margin-bottom: 16px;
                }
                .enterprise-card h3 {
                    margin-bottom: 8px;
                }
                .enterprise-region {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .enterprise-desc {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 16px;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .enterprise-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 16px;
                    border-top: 1px solid var(--border);
                }
                .cases-count {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--primary);
                }
                .view-cases {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                @media (max-width: 1024px) {
                    .enterprises-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .filters {
                        flex-direction: column;
                    }
                    .search-input {
                        max-width: 100%;
                    }
                    .enterprises-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}