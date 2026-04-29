import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <Link to="/" className="logo">
                            <div className="logo-icon">
                                <span></span>
                            </div>
                            <div className="logo-text">
                                <div>ЗАВОДСКОЕ</div>
                                <div>ГТО</div>
                            </div>
                        </Link>
                        <p>Платформа инженерных кейсов для школьников и студентов. Решай реальные задачи и строй карьеру в промышленности.</p>
                    </div>

                    <div className="footer-links">
                        <h4>Навигация</h4>
                        <nav>
                            <Link to="/about">О проекте</Link>
                            <Link to="/how-it-works">Как это работает</Link>
                            <Link to="/cases">Кейсы</Link>
                            <Link to="/enterprises">Предприятия</Link>
                        </nav>
                    </div>

                    <div className="footer-links">
                        <h4>Ресурсы</h4>
                        <nav>
                            <Link to="/rating">Рейтинг</Link>
                            <Link to="/news">Новости</Link>
                            <Link to="/contacts">Контакты</Link>
                        </nav>
                    </div>

                    <div className="footer-links">
                        <h4>Документы</h4>
                        <nav>
                            <a href="#">Политика конфиденциальности</a>
                            <a href="#">Согласие на обработку персональных данных</a>
                        </nav>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 Заводское ГТО. Все права защищены.</p>
                    <p>Контактный email: <a href="mailto:info@factory-gto.ru">info@factory-gto.ru</a></p>
                </div>
            </div>

            <style>{`
                .footer {
                    background: rgba(246, 249, 255, 0.5);
                    border-top: 1px solid rgba(29, 64, 120, 0.08);
                    padding: 64px 0 32px;
                    margin-top: 80px;
                }
                .footer-grid {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 48px;
                    margin-bottom: 48px;
                }
                .footer-brand p {
                    margin-top: 16px;
                    color: var(--muted);
                    font-size: 14px;
                    line-height: 1.6;
                }
                .footer-links h4 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: var(--text);
                }
                .footer-links nav {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .footer-links a {
                    color: var(--muted);
                    font-size: 14px;
                    transition: color 0.2s;
                }
                .footer-links a:hover {
                    color: var(--blue);
                }
                .footer-bottom {
                    border-top: 1px solid rgba(29, 64, 120, 0.08);
                    padding-top: 32px;
                    display: flex;
                    justify-content: space-between;
                    color: var(--muted);
                    font-size: 14px;
                }
                .footer-bottom a {
                    color: var(--blue);
                }
                .logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }
                .logo-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 50%;
                    border: 3px solid #1d63d6;
                    position: relative;
                    flex: none;
                }
                .logo-icon span {
                    position: absolute;
                    inset: 9px;
                    border: 3px solid #1d63d6;
                    border-radius: 50%;
                }
                .logo-text {
                    font-weight: 800;
                    line-height: 1;
                }
                .logo-text div:first-child {
                    font-size: 13px;
                    letter-spacing: 0.4px;
                    color: var(--text);
                }
                .logo-text div:last-child {
                    font-size: 28px;
                    color: #1d63d6;
                }
                @media (max-width: 768px) {
                    .footer-grid {
                        grid-template-columns: 1fr;
                        gap: 32px;
                    }
                    .footer-bottom {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
}