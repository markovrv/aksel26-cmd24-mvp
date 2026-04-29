import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container header-inner">
                <Link to="/" className="logo">
                    <div className="logo-icon">
                        <span></span>
                    </div>
                    <div className="logo-text">
                        <div>ЗАВОДСКОЕ</div>
                        <div>ГТО</div>
                    </div>
                </Link>

                <nav className={`nav ${menuOpen ? 'open' : ''}`}>
                    <Link to="/about">О проекте</Link>
                    <Link to="/how-it-works">Как это работает</Link>
                    <Link to="/cases">Кейсы</Link>
                    <Link to="/enterprises">Предприятия</Link>
                    <Link to="/rating">Рейтинг</Link>
                    <Link to="/news">Новости</Link>
                    <Link to="/contacts">Контакты</Link>
                </nav>

                <div className="header-actions">
                    {user ? (
                        <div className="user-menu">
                            <Link to={user.role === 'admin' ? '/admin' : user.role === 'enterprise' ? '/enterprise' : '/participant'} className="btn btn-primary">
                                Кабинет
                            </Link>
                            <button onClick={handleLogout} className="btn btn-ghost">Выйти</button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost">Войти</Link>
                            <Link to="/register" className="btn btn-primary">Регистрация</Link>
                        </>
                    )}
                </div>

                <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>

            <style>{`
                .header {
                    background: rgba(246, 249, 255, 0.92);
                    backdrop-filter: blur(12px);
                    border-bottom: 1px solid rgba(29, 64, 120, 0.08);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .header-inner {
                    height: 74px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
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
                .nav {
                    display: flex;
                    gap: 26px;
                    font-size: 15px;
                    color: #526074;
                }
                .nav a {
                    color: #526074;
                    transition: color 0.2s;
                }
                .nav a:hover {
                    color: var(--blue);
                    text-decoration: none;
                }
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                .user-menu {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .burger {
                    display: none;
                    flex-direction: column;
                    gap: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                }
                .burger span {
                    width: 24px;
                    height: 2px;
                    background: var(--text);
                    border-radius: 2px;
                }
                @media (max-width: 1100px) {
                    .nav {
                        display: none;
                    }
                    .nav.open {
                        display: flex;
                        position: absolute;
                        top: 74px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        gap: 16px;
                        padding: 24px;
                        border-bottom: 1px solid rgba(29, 64, 120, 0.08);
                    }
                    .burger {
                        display: flex;
                    }
                }
            `}</style>
        </header>
    );
}