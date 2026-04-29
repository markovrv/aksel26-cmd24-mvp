import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function NotFound() {
    return (
        <MainLayout>
            <div className="container">
                <div className="not-found">
                    <h1>404</h1>
                    <h2>Страница не найдена</h2>
                    <p>Извините, запрашиваемая страница не существует или была перемещена.</p>
                    <Link to="/" className="btn btn-primary">На главную</Link>
                </div>
            </div>

            <style>{`
                .not-found {
                    text-align: center;
                    padding: 120px 24px;
                }
                .not-found h1 {
                    font-size: 120px;
                    color: var(--primary);
                    margin-bottom: 24px;
                }
                .not-found h2 {
                    margin-bottom: 16px;
                }
                .not-found p {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                }
            `}</style>
        </MainLayout>
    );
}