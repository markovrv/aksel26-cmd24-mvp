import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

export default function NewsDetail() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.news.get(id)
            .then(setItem)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <MainLayout>
                <div className="loading">Загрузка...</div>
            </MainLayout>
        );
    }

    if (!item) {
        return (
            <MainLayout>
                <div className="empty-state">
                    <h3>Новость не найдена</h3>
                    <Link to="/news" className="btn btn-secondary">Вернуться к списку</Link>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container">
                <article className="news-detail">
                    <Link to="/news" className="back-link">← Назад к новостям</Link>
                    <span className="news-date">{new Date(item.published_at).toLocaleDateString('ru')}</span>
                    <h1>{item.title}</h1>
                    {item.summary && <p className="summary">{item.summary}</p>}
                    {item.image_url && (
                        <div className="news-image" style={{ backgroundImage: `url(${item.image_url})` }} />
                    )}
                    <div className="content">{item.content}</div>
                </article>
            </div>

            <style>{`
                .news-detail {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 48px 0 80px;
                }
                .back-link {
                    display: inline-block;
                    margin-bottom: 24px;
                    color: var(--primary);
                }
                .news-date {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .news-detail h1 {
                    margin: 16px 0 24px;
                }
                .summary {
                    font-size: 20px;
                    color: var(--text-secondary);
                    margin-bottom: 24px;
                }
                .news-image {
                    height: 400px;
                    background-size: cover;
                    background-position: center;
                    border-radius: var(--radius-lg);
                    margin-bottom: 32px;
                }
                .content {
                    line-height: 1.8;
                    font-size: 18px;
                    white-space: pre-line;
                }
            `}</style>
        </MainLayout>
    );
}