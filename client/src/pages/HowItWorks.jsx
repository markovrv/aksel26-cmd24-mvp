import MainLayout from '../layouts/MainLayout';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
    return (
        <MainLayout>
            <div className="container">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1>Как это работает</h1>
                    <p>Пять простых шагов к успешному участию</p>
                </div>

                <div className="steps-container">
                    <div className="step-block">
                        <div className="step-icon">1</div>
                        <div className="step-content">
                            <h2>Выберите предприятие</h2>
                            <p>На нашей платформе представлены ведущие промышленные предприятия России. Изучите их профили, узнайте о направлениях деятельности и выберите наиболее интересное для вас. Каждое предприятие имеет свой профиль с описанием и контактными данными.</p>
                        </div>
                    </div>

                    <div className="step-block">
                        <div className="step-icon">2</div>
                        <div className="step-content">
                            <h2>Найдите кейс</h2>
                            <p>После выбора предприятия ознакомьтесь со списком его кейсов. Обратите внимание на категории участников, дедлайны и требования. Выберите задачу, которая соответствует вашему уровню знаний и интересам.</p>
                        </div>
                    </div>

                    <div className="step-block">
                        <div className="step-icon">3</div>
                        <div className="step-content">
                            <h2>Подготовьте решение</h2>
                            <p>Изучите материалы кейса, соберите необходимые данные и подготовьте решение. Вы можете оформить его в виде текста или подготовить файлы (PDF, DOCX, PPTX). Убедитесь, что ваше решение соответствует всем требованиям.</p>
                        </div>
                    </div>

                    <div className="step-block">
                        <div className="step-icon">4</div>
                        <div className="step-content">
                            <h2>Отправьте работу</h2>
                            <p>Загрузите ваше решение через форму на странице кейса. До дедлайна вы можете редактировать своё решение. После истечения срока приём работ закрывается, и решения передаются на оценку.</p>
                        </div>
                    </div>

                    <div className="step-block">
                        <div className="step-icon">5</div>
                        <div className="step-content">
                            <h2>Получите оценку и место в рейтинге</h2>
                            <p>Эксперты предприятия оценят вашу работу по пяти критериям: проработка, применимость, оригинальность, техническая логика и презентация. Ваши баллы добавятся в общий рейтинг участников.</p>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>Готовы начать?</h2>
                    <p>Присоединяйтесь к тысячам участников платформы</p>
                    <div className="cta-buttons">
                        <Link to="/cases" className="btn btn-primary">Выбрать кейс</Link>
                        <Link to="/register" className="btn btn-secondary">Зарегистрироваться</Link>
                    </div>
                </div>
            </div>

            <style>{`
                .steps-container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .step-block {
                    display: flex;
                    gap: 32px;
                    margin-bottom: 48px;
                    padding: 32px;
                    background: var(--white);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow);
                }
                .step-icon {
                    width: 64px;
                    height: 64px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .step-content h2 {
                    margin-bottom: 16px;
                    font-size: 24px;
                }
                .step-content p {
                    line-height: 1.7;
                    color: var(--text-secondary);
                }
                .cta-section {
                    text-align: center;
                    padding: 64px;
                    background: linear-gradient(135deg, var(--primary) 0%, #1F57E7 100%);
                    border-radius: var(--radius-lg);
                    color: white;
                    margin-top: 64px;
                }
                .cta-section h2 {
                    color: white;
                    margin-bottom: 16px;
                }
                .cta-section p {
                    opacity: 0.9;
                    margin-bottom: 32px;
                }
                .cta-buttons {
                    display: flex;
                    gap: 16px;
                    justify-content: center;
                }
                @media (max-width: 768px) {
                    .step-block {
                        flex-direction: column;
                        text-align: center;
                    }
                    .step-icon {
                        margin: 0 auto;
                    }
                }
            `}</style>
        </MainLayout>
    );
}