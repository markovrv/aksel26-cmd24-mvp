import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

const CATEGORIES = [
    { value: '', label: 'Все категории' },
    { value: 'school_8_9', label: 'Школьники 8–9 класс' },
    { value: 'school_10_11', label: 'Школьники 10–11 класс' },
    { value: 'spo', label: 'СПО / Колледж' },
    { value: 'university', label: 'Студенты ВУЗ' }
];

export default function Cases() {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');

    useEffect(() => {
        loadCases();
    }, [searchParams]);

    const loadCases = async () => {
        setLoading(true);
        try {
            const params = {};
            const category = searchParams.get('category');
            const status = searchParams.get('status');
            if (category) params.category = category;
            if (status) params.status = status;
            if (search) params.search = search;
            const data = await api.cases.list(params);
            setCases(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (search) params.set('search', search);
        else params.delete('search');
        setSearchParams(params);
    };

    const handleFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        setSearchParams(params);
    };

    const resetFilters = () => {
        setSearch('');
        setSearchParams({});
    };

    return (
        <MainLayout>
            <div className="container">
                <div className="page-header">
                    <h1>Кейсы</h1>
                    <p>Выберите задачу и продемонстрируйте свои инженерные способности</p>
                </div>

                <div className="filters">
                    <form onSubmit={handleSearch} className="search-form">
                        <input type="text" placeholder="Поиск по названию..." value={search} onChange={e => setSearch(e.target.value)} />
                        <button type="submit" className="btn btn-primary">Найти</button>
                    </form>

                    <div className="filter-group">
                        <select value={searchParams.get('category') || ''} onChange={e => handleFilter('category', e.target.value)}>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>

                        <select value={searchParams.get('status') || ''} onChange={e => handleFilter('status', e.target.value)}>
                            <option value="">Все статусы</option>
                            <option value="open">Открыт</option>
                            <option value="closed">Закрыт</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : cases.length === 0 ? (
                    <div className="empty-state">
                        <h3>По выбранным параметрам ничего не найдено</h3>
                        <button onClick={resetFilters} className="btn btn-secondary">Сбросить фильтры</button>
                    </div>
                ) : (
                    <div className="cases-grid">
                        {cases.map(c => (
                            <Link to={`/cases/${c.id}`} key={c.id} className="case-card card">
                                <div className="case-header">
                                    <span className={`badge badge-${c.status}`}>{c.status === 'open' ? 'Открыт' : 'Закрыт'}</span>
                                    <span className="case-enterprise">{c.enterprise_name}</span>
                                </div>
                                <h3>{c.title}</h3>
                                <p>{c.short_description}</p>
                                <div className="case-footer">
                                    <span>Дедлайн: {new Date(c.deadline).toLocaleDateString('ru')}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .filters {
                    display: flex;
                    justify-content: space-between;
                    gap: 24px;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                }
                .search-form {
                    display: flex;
                    gap: 12px;
                    flex: 1;
                    max-width: 400px;
                }
                .search-form input {
                    flex: 1;
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 16px;
                }
                .filter-group {
                    display: flex;
                    gap: 12px;
                }
                .filter-group select {
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 16px;
                    background: var(--white);
                    cursor: pointer;
                }
                .cases-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding-bottom: 80px;
                }
                .case-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text-main);
                }
                .case-card:hover {
                    text-decoration: none;
                }
                .case-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .case-enterprise {
                    font-size: 14px;
                    color: var(--text-secondary);
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
                @media (max-width: 1024px) {
                    .cases-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .filters {
                        flex-direction: column;
                    }
                    .search-form {
                        max-width: 100%;
                    }
                    .cases-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}