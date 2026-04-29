import { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

const CATEGORY_LABELS = {
    school_8_9: 'Школьники 8–9',
    school_10_11: 'Школьники 10–11',
    spo: 'СПО / Колледж',
    university: 'Студенты ВУЗ'
};

export default function Rating() {
    const [rating, setRating] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('');
    const [region, setRegion] = useState('');

    useEffect(() => {
        loadRating();
    }, [category, region]);

    const loadRating = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (region) params.region = region;
            const data = await api.rating.list(params);
            setRating(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="container">
                <div className="page-header">
                    <h1>Рейтинг участников</h1>
                    <p>Топ-10 лучших участников платформы</p>
                </div>

                <div className="filters">
                    <select value={category} onChange={e => setCategory(e.target.value)}>
                        <option value="">Все категории</option>
                        <option value="school_8_9">Школьники 8–9 класс</option>
                        <option value="school_10_11">Школьники 10–11 класс</option>
                        <option value="spo">СПО / Колледж</option>
                        <option value="university">Студенты ВУЗ</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Фильтр по региону..."
                        value={region}
                        onChange={e => setRegion(e.target.value)}
                    />
                </div>

                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : rating.length === 0 ? (
                    <div className="empty-state">
                        <h3>Пока нет участников в рейтинге</h3>
                        <p>Участвуйте в кейсах и получайте оценки</p>
                    </div>
                ) : (
                    <div className="rating-table card">
                        <table>
                            <thead>
                                <tr>
                                    <th>Место</th>
                                    <th>Участник</th>
                                    <th>Категория</th>
                                    <th>Регион</th>
                                    <th>Баллы</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rating.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="place">{index + 1}</td>
                                        <td className="name">{item.full_name}</td>
                                        <td>{CATEGORY_LABELS[item.category] || item.category}</td>
                                        <td>{item.region || '—'}</td>
                                        <td className="score">{item.total_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .filters {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .filters select, .filters input {
                    padding: 12px 16px;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 16px;
                    background: var(--white);
                }
                .rating-table {
                    overflow-x: auto;
                    padding: 0;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 16px 24px;
                    text-align: left;
                }
                th {
                    background: var(--background);
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                }
                tr:not(:last-child) td {
                    border-bottom: 1px solid var(--border);
                }
                .place {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--primary);
                    width: 80px;
                }
                .name {
                    font-weight: 600;
                }
                .score {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--primary);
                }
                @media (max-width: 768px) {
                    .filters {
                        flex-direction: column;
                    }
                    th, td {
                        padding: 12px 16px;
                    }
                }
            `}</style>
        </MainLayout>
    );
}