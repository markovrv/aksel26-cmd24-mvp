import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';

const CATEGORIES = [
    { key: 'school_8_9', label: 'Школьники\n8–9 класс', desc: 'Решай интересные задачи и открывай мир инженерии', color: 'blue' },
    { key: 'school_10_11', label: 'Школьники\n10–11 класс', desc: 'Прокачивай навыки и готовься к будущей карьере', color: 'green' },
    { key: 'spo', label: 'Студенты\nСПО / Колледж', desc: 'Примени знания на практике и получай ценный опыт', color: 'orange' },
    { key: 'university', label: 'Студенты\nВУЗ', desc: 'Решай сложные кейсы и стань востребованным специалистом', color: 'purple' }
];

const TRUSTED_ENTERPRISES = ['Ростех', 'Северсталь', 'Росатом', 'ОДК', 'ЕВРАЗ', 'КАМАЗ', 'и другие'];

export default function Home() {
    const [cases, setCases] = useState([]);
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.cases.list({ status: 'open', sort: 'deadline' }),
            api.news.list()
        ]).then(([casesData, newsData]) => {
            setCases(casesData.slice(0, 6));
            setNews(newsData.slice(0, 3));
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <MainLayout>
            <section className="hero">
                <div className="container hero-grid">
                    <div className="hero-left">
                        <div className="pill">Платформа инженерных кейсов</div>
                        <h1>Решай реальные<br />задачи предприятий<br /><span>и развивай будущее!</span></h1>
                        <p>«Заводское ГТО» — это возможность проявить себя, получить опыт и построить карьеру в промышленности</p>
                        <div className="hero-buttons">
                            <Link to="/cases" className="btn btn-primary btn-large">Выбрать кейс <span className="arrow">→</span></Link>
                            <Link to="/enterprises" className="btn btn-outline btn-large">
                                <span className="briefcase"></span>Предприятиям
                            </Link>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-image">
                            <div className="cloud cloud-1"></div>
                            <div className="cloud cloud-2"></div>
                            <div className="cloud cloud-3"></div>
                            <div className="plant-ground"></div>
                            <div className="plant-tower tower-1"></div>
                            <div className="plant-tower tower-2"></div>
                            <div className="plant-tower tower-3"></div>
                            <div className="plant-pipe"></div>

                            <div className="info-card info-card-top">
                                <div className="info-card-icon">◎</div>
                                <div>
                                    <div className="info-card-title">Реальные задачи</div>
                                    <div className="info-card-text">Кейсы от ведущих предприятий страны</div>
                                </div>
                            </div>
                            <div className="info-card info-card-mid">
                                <div className="info-card-icon">◌</div>
                                <div>
                                    <div className="info-card-title">Развитие и опыт</div>
                                    <div className="info-card-text">Прокачивай навыки на практике</div>
                                </div>
                            </div>
                            <div className="info-card info-card-bottom">
                                <div className="info-card-icon">🏆</div>
                                <div>
                                    <div className="info-card-title">Признание и карьера</div>
                                    <div className="info-card-text">Лучшие участники получают приглашения на стажировки и работу</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container">
                    <div className="stats">
                        <div className="stat">
                            <div className="stat-icon">🏢</div>
                            <div>
                                <div className="stat-value">120+</div>
                                <div className="stat-label">предприятий на платформе</div>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="stat-icon">📁</div>
                            <div>
                                <div className="stat-value">350+</div>
                                <div className="stat-label">активных кейсов</div>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="stat-icon">👥</div>
                            <div>
                                <div className="stat-value">4500+</div>
                                <div className="stat-label">участников</div>
                            </div>
                        </div>
                        <div className="stat">
                            <div className="stat-icon">🏆</div>
                            <div>
                                <div className="stat-value">800+</div>
                                <div className="stat-label">успешных решений</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="categories">
                <div className="container">
                    <h2>Выбери свою категорию</h2>
                    <div className="cards-grid">
                        {CATEGORIES.map(cat => (
                            <Link to={`/cases?category=${cat.key}`} key={cat.key} className={`card card-${cat.color}`}>
                                <div className="card-content">
                                    <h3>{cat.label}</h3>
                                    <p>{cat.desc}</p>
                                    <span className="card-link">→</span>
                                </div>
                                <div className={`student student-${cat.color}`}></div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="partners">
                <div className="container">
                    <h3>Нам доверяют ведущие предприятия</h3>
                    <div className="partners-row">
                        {TRUSTED_ENTERPRISES.map(name => (
                            <span key={name}>{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="latest-cases">
                <div className="container">
                    <div className="section-header">
                        <h2>Последние кейсы</h2>
                        <Link to="/cases" className="btn btn-outline">Все кейсы</Link>
                    </div>
                    {loading ? (
                        <div className="loading">Загрузка...</div>
                    ) : (
                        <div className="cases-grid">
                            {cases.map(c => (
                                <Link to={`/cases/${c.id}`} key={c.id} className="case-card card">
                                    <div className="case-header">
                                        <span className="badge badge-open">Открыт</span>
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
            </section>

            <section className="latest-news">
                <div className="container">
                    <div className="section-header">
                        <h2>Новости</h2>
                        <Link to="/news" className="btn btn-outline">Все новости</Link>
                    </div>
                    <div className="news-grid">
                        {news.map(item => (
                            <Link to={`/news/${item.id}`} key={item.id} className="news-card card">
                                <span className="news-date">{new Date(item.published_at).toLocaleDateString('ru')}</span>
                                <h3>{item.title}</h3>
                                <p>{item.summary}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <style>{`
                .hero {
                    padding: 26px 0 26px;
                }
                .hero-grid {
                    display: grid;
                    grid-template-columns: 1.02fr 0.98fr;
                    align-items: start;
                    gap: 28px;
                }
                .hero-left {
                    padding: 24px 0 0;
                }
                .pill {
                    display: inline-block;
                    padding: 10px 16px;
                    border-radius: 12px;
                    background: #dce9ff;
                    color: #4c76c4;
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 18px;
                }
                .hero-left h1 {
                    margin: 0;
                    font-size: 63px;
                    line-height: 0.96;
                    letter-spacing: -1.8px;
                    font-weight: 900;
                }
                .hero-left h1 span {
                    color: #165cc9;
                }
                .hero-left p {
                    margin: 22px 0 28px;
                    max-width: 520px;
                    font-size: 18px;
                    line-height: 1.45;
                    color: #5c6777;
                }
                .hero-buttons {
                    display: flex;
                    gap: 14px;
                    flex-wrap: wrap;
                }
                .arrow {
                    font-size: 20px;
                    margin-left: 10px;
                }
                .briefcase {
                    width: 18px;
                    height: 18px;
                    border: 2px solid currentColor;
                    border-radius: 4px;
                    position: relative;
                    display: inline-block;
                    margin-right: 10px;
                }
                .briefcase:before {
                    content: "";
                    position: absolute;
                    left: 4px;
                    right: 4px;
                    top: -5px;
                    height: 5px;
                    border: 2px solid currentColor;
                    border-bottom: none;
                    border-radius: 6px 6px 0 0;
                }
                .hero-right {
                    position: relative;
                }
                .hero-image {
                    height: 410px;
                    overflow: hidden;
                    position: relative;
                    background: linear-gradient(160deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 42%), linear-gradient(180deg, #78b9ff 0%, #d8ecff 44%, #fefefe 44%, #fefefe 100%);
                    clip-path: polygon(14% 0, 100% 0, 100% 100%, 0 100%);
                    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.18);
                    border-radius: 22px;
                }
                .cloud {
                    position: absolute;
                    background: rgba(255,255,255,0.92);
                    filter: blur(0.2px);
                    border-radius: 50px;
                }
                .cloud-1 {
                    width: 130px;
                    height: 46px;
                    left: 28px;
                    top: 48px;
                    box-shadow: 40px -8px 0 0 rgba(255,255,255,0.92), 76px 5px 0 2px rgba(255,255,255,0.92);
                }
                .cloud-2 {
                    width: 170px;
                    height: 56px;
                    right: 100px;
                    top: 28px;
                    box-shadow: 46px 0 0 0 rgba(255,255,255,0.92), 90px 8px 0 2px rgba(255,255,255,0.92);
                }
                .cloud-3 {
                    width: 120px;
                    height: 40px;
                    right: 18px;
                    top: 110px;
                    box-shadow: 34px -6px 0 0 rgba(255,255,255,0.9);
                }
                .plant-ground {
                    left: 0;
                    right: 0;
                    height: 88px;
                    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(22,59,107,0.10) 100%);
                    position: absolute;
                    bottom: 0;
                }
                .plant-tower {
                    background: linear-gradient(180deg,#d9dde2,#7d8a99 35%,#eef1f5 36%,#9aa6b4 100%);
                    box-shadow: 0 0 0 1px rgba(66,79,101,0.2);
                    position: absolute;
                    bottom: 35px;
                }
                .plant-tower:before {
                    content: "";
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: -18px;
                    height: 18px;
                    background: #cfd7df;
                    border-radius: 8px 8px 0 0;
                }
                .tower-1 {
                    width: 28px;
                    height: 175px;
                    left: 190px;
                }
                .tower-2 {
                    width: 40px;
                    height: 255px;
                    left: 245px;
                    bottom: 38px;
                }
                .tower-3 {
                    width: 48px;
                    height: 295px;
                    left: 330px;
                }
                .tower-3:after {
                    content: "";
                    position: absolute;
                    left: 9px;
                    right: 9px;
                    top: -26px;
                    height: 26px;
                    background: #dd7b42;
                    border-radius: 8px 8px 0 0;
                    box-shadow: 0 -10px 0 0 #3a3f49 inset;
                }
                .plant-pipe {
                    left: 286px;
                    bottom: 18px;
                    width: 170px;
                    height: 74px;
                    border-radius: 18px 18px 0 0;
                    border-top: 10px solid #6b7786;
                    border-left: 10px solid #6b7786;
                    border-right: 10px solid #6b7786;
                    transform: skewX(-12deg);
                    opacity: 0.65;
                    position: absolute;
                }
                .info-card {
                    position: absolute;
                    right: 18px;
                    width: 275px;
                    background: rgba(255,255,255,0.93);
                    border-radius: 0; /* reset, individual cards set corners */
                    box-shadow: var(--shadow);
                    padding: 18px 18px 14px;
                    display: flex;
                    gap: 14px;
                }
                .info-card-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    background: #edf4ff;
                    color: #4a7ede;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex: none;
                }
                .info-card-title {
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 4px;
                }
                .info-card-text {
                    font-size: 13px;
                    line-height: 1.35;
                    color: #6a7484;
                }
                .info-card-top { top: 82px; border-radius: 18px 18px 0 0; }
                .info-card-mid { top: 170px; border-radius: 0; }
                .info-card-bottom { top: 258px; border-radius: 0 0 18px 18px; }

                .stats {
                    margin-top: 22px;
                    background: rgba(255,255,255,0.86);
                    border-radius: 18px;
                    box-shadow: var(--shadow);
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    padding: 18px 8px;
                }
                .stat {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 14px;
                    padding: 6px 16px;
                    border-right: 1px solid rgba(136,156,182,0.22);
                }
                .stat:last-child {
                    border-right: none;
                }
                .stat-icon {
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: #eef4ff;
                    color: #2b67d5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 21px;
                    flex: none;
                }
                .stat-value {
                    font-size: 26px;
                    font-weight: 800;
                    color: #1f61d5;
                    line-height: 1;
                }
                .stat-label {
                    font-size: 13px;
                    color: #667286;
                    margin-top: 5px;
                }

                .categories {
                    padding: 24px 0 18px;
                }
                .categories h2 {
                    text-align: center;
                    margin: 10px 0 20px;
                }
                .cards-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                }
                .card {
                    min-height: 142px;
                    border-radius: 18px;
                    padding: 18px 16px;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 24px rgba(45, 76, 123, 0.08);
                    text-decoration: none;
                    color: var(--text);
                }
                .card:hover {
                    transform: translateY(-2px);
                }
                .card-content {
                    position: relative;
                    z-index: 2;
                    max-width: 56%;
                }
                .card h3 {
                    margin: 0 0 10px;
                    font-size: 18px;
                    line-height: 1.05;
                    font-weight: 800;
                    white-space: pre-line;
                }
                .card p {
                    margin: 0 0 20px;
                    font-size: 12.5px;
                    line-height: 1.4;
                    color: #5f6a77;
                }
                .card-link {
                    font-size: 24px;
                    display: inline-block;
                    color: inherit;
                }
                .student {
                    position: absolute;
                    right: 10px;
                    bottom: 0;
                    width: 118px;
                    height: 118px;
                    border-radius: 18px 18px 0 0;
                    background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 18%, rgba(0,0,0,0.05) 100%);
                }
                .student:before {
                    content: "";
                    position: absolute;
                    left: 26px;
                    top: 8px;
                    width: 64px;
                    height: 78px;
                    border-radius: 28px 28px 18px 18px;
                    background: var(--hair, #7f4a2e);
                    box-shadow: 0 18px 0 0 var(--shirt, #3d73d8) inset;
                }
                .student:after {
                    content: "";
                    position: absolute;
                    left: 18px;
                    top: 48px;
                    width: 82px;
                    height: 60px;
                    border-radius: 12px;
                    background: var(--laptop, #7a8aa3);
                    transform: skewX(-14deg);
                }
                .card-blue { background: linear-gradient(135deg, #dbeaff, #edf4ff); }
                .card-green { background: linear-gradient(135deg, #def1e6, #eef8ef); }
                .card-orange { background: linear-gradient(135deg, #f7e8c7, #fff4df); }
                .card-purple { background: linear-gradient(135deg, #eadff8, #f4edff); }
                .student-blue { --hair: #5a3c25; --shirt: #2f73d8; --laptop: #4f5b73; }
                .student-green { --hair: #6a3d22; --shirt: #4d8b57; --laptop: #57687c; }
                .student-orange { --hair: #7a4b2a; --shirt: #d78328; --laptop: #667186; }
                .student-purple { --hair: #5a3825; --shirt: #8a5cbc; --laptop: #5c6780; }

                .partners {
                    padding: 8px 0 34px;
                }
                .partners h3 {
                    text-align: center;
                    font-size: 16px;
                    margin: 4px 0 16px;
                    color: #39485f;
                }
                .partners-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 18px;
                    flex-wrap: wrap;
                    color: #7b8491;
                    font-size: 18px;
                    font-weight: 700;
                    opacity: 0.95;
                }

                .latest-cases {
                    padding: 24px 0;
                }
                .latest-news {
                    padding: 24px 0 48px;
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
                .cases-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                .case-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text);
                }
                .case-card:hover {
                    transform: translateY(-2px);
                }
                .case-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .case-enterprise {
                    font-size: 14px;
                    color: var(--muted);
                }
                .case-card h3 {
                    font-size: 17px;
                    margin-bottom: 8px;
                }
                .case-card p {
                    color: var(--muted);
                    font-size: 14px;
                    margin-bottom: 12px;
                    line-height: 1.5;
                }
                .case-footer {
                    font-size: 13px;
                    color: var(--muted);
                }
                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                .news-card {
                    display: block;
                    text-decoration: none;
                    color: var(--text);
                }
                .news-card:hover {
                    transform: translateY(-2px);
                }
                .news-date {
                    font-size: 13px;
                    color: var(--muted);
                    margin-bottom: 8px;
                    display: block;
                }
                .news-card h3 {
                    font-size: 17px;
                    margin-bottom: 8px;
                }
                .news-card p {
                    color: var(--muted);
                    font-size: 14px;
                    line-height: 1.5;
                }

                @media (max-width: 1100px) {
                    .hero-grid {
                        grid-template-columns: 1fr;
                    }
                    .hero-image {
                        clip-path: none;
                    }
                    .cards-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .stats {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .cases-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .hero-left h1 {
                        font-size: 42px;
                    }
                    .cards-grid {
                        grid-template-columns: 1fr;
                    }
                    .cases-grid,
                    .news-grid {
                        grid-template-columns: 1fr;
                    }
                    .section-header {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </MainLayout>
    );
}