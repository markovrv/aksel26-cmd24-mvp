import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

export default function News() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.news.list()
            .then(setNews)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <MainLayout>
            <div className="container">
                <div className="page-header">
                    <h1>Новости</h1>
                    <p>Актуальные события платформы</p>
                </div>

                {loading ? (
                    <div className="loading">Загрузка...</div>
                ) : (
                    <div className="news-grid">
                        {news.map(item => (
                            <Link to={`/news/${item.id}`} key={item.id} className="news-card card">
                                {item.image_url && (
                                    <div className="news-image" style={{ backgroundImage: `url(${item.image_url})` }} />
                                )}
                                <div className="news-content">
                                    <span className="news-date">{new Date(item.published_at).toLocaleDateString('ru')}</span>
                                    <h3>{item.title}</h3>
                                    <p>{item.summary}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                    padding-bottom: 80px;
                }
                .news-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text-main);
                    overflow: hidden;
                }
                .news-card:hover {
                    text-decoration: none;
                }
                .news-image {
                    height: 160px;
                    background-size: cover;
                    background-position: center;
                    margin: -24px -24px 16px;
                    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
                }
                .news-date {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .news-card h3 {
                    margin: 8px 0;
                }
                .news-card p {
                    color: var(--text-secondary);
                    font-size: 14px;
                }
                @media (max-width: 1024px) {
                    .news-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .news-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}