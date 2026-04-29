import MainLayout from '../layouts/MainLayout';

export default function About() {
    return (
        <MainLayout>
            <div className="container">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1>О проекте</h1>
                    <p>Платформа инженерных кейсов для будущих профессионалов</p>
                </div>

                <div className="about-content">
                    <section className="about-section">
                        <h2>Что такое Заводское ГТО?</h2>
                        <p>Заводское ГТО — это образовательная платформа, которая даёт возможность школьникам и студентам решать реальные производственные задачи от ведущих предприятий России. Это уникальная возможность получить практический опыт, продемонстрировать свои способности и заявить о себе в профессиональном сообществе.</p>
                    </section>

                    <section className="about-section">
                        <h2>Наша миссия</h2>
                        <p>Мы верим, что лучший способ научиться — это решать настоящие задачи. Заводское ГТО соединяет талантливых молодых людей с реальными вызовами, которые стоят перед промышленностью сегодня. Участники получают возможность внести свой вклад в развитие производства, а предприятия — найти перспективных кандидатов на раннем этапе.</p>
                    </section>

                    <section className="about-section">
                        <h2>Как это работает?</h2>
                        <div className="steps">
                            <div className="step-item">
                                <div className="step-num">1</div>
                                <h3>Выберите предприятие</h3>
                                <p>Изучите каталог предприятий-партнёров и найдите интересное направление</p>
                            </div>
                            <div className="step-item">
                                <div className="step-num">2</div>
                                <h3>Выберите кейс</h3>
                                <p>Ознакомьтесь с условиями задач и выберите подходящую для вас</p>
                            </div>
                            <div className="step-item">
                                <div className="step-num">3</div>
                                <h3>Решите задачу</h3>
                                <p>Подготовьте решение в текстовом виде или загрузите файлы</p>
                            </div>
                            <div className="step-item">
                                <div className="step-num">4</div>
                                <h3>Получите оценку</h3>
                                <p>Эксперты предприятия оценят вашу работу и поставят баллы</p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h2>Кому это полезно?</h2>
                        <div className="benefits-grid">
                            <div className="benefit-card">
                                <h3>Школьникам 8–9 класс</h3>
                                <p>Первый шаг в мир инженерных профессий. Простые задачи помогут понять основы и определиться с направлением.</p>
                            </div>
                            <div className="benefit-card">
                                <h3>Школьникам 10–11 класс</h3>
                                <p>Возможность получить реальный опыт для портфолио и подготовки к поступлению в ведущие вузы.</p>
                            </div>
                            <div className="benefit-card">
                                <h3>Студентам СПО</h3>
                                <p>Практика, которая пригодится в работе. Реальные задачи от предприятий вашей отрасли.</p>
                            </div>
                            <div className="benefit-card">
                                <h3>Студентам ВУЗ</h3>
                                <p>Сложные кейсы для глубокого погружения. Шанс привлечь внимание потенциальных работодателей.</p>
                            </div>
                        </div>
                    </section>

                    <section className="about-section">
                        <h2>Преимущества платформы</h2>
                        <ul className="features-list">
                            <li>Реальные задачи от ведущих предприятий России</li>
                            <li>Возможность получить обратную связь от экспертов отрасли</li>
                            <li>Попадание в рейтинг лучших участников</li>
                            <li>Шанс быть замеченным работодателями</li>
                            <li>Развитие практических навыков</li>
                            <li>Бесплатное участие для всех категорий</li>
                        </ul>
                    </section>
                </div>
            </div>

            <style>{`
                .about-content {
                    max-width: 900px;
                    margin: 0 auto;
                    padding-bottom: 80px;
                }
                .about-section {
                    margin-bottom: 64px;
                }
                .about-section h2 {
                    margin-bottom: 24px;
                }
                .about-section p {
                    line-height: 1.8;
                    font-size: 18px;
                    color: var(--text-secondary);
                }
                .steps {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                }
                .step-item {
                    text-align: center;
                    padding: 24px;
                    background: var(--white);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow);
                }
                .step-num {
                    width: 48px;
                    height: 48px;
                    background: var(--primary);
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 700;
                    margin: 0 auto 16px;
                }
                .step-item h3 {
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                .step-item p {
                    font-size: 14px;
                }
                .benefits-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                .benefit-card {
                    padding: 32px;
                    background: var(--white);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow);
                }
                .benefit-card h3 {
                    margin-bottom: 12px;
                    color: var(--primary);
                }
                .features-list {
                    list-style: none;
                }
                .features-list li {
                    padding: 16px 0;
                    border-bottom: 1px solid var(--border);
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .features-list li::before {
                    content: '✓';
                    color: var(--primary);
                    font-weight: 700;
                }
                @media (max-width: 1024px) {
                    .steps {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                @media (max-width: 768px) {
                    .steps, .benefits-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}