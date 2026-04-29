import { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

export default function Contacts() {
    const [form, setForm] = useState({ name: '', email: '', message: '', consent: false });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <MainLayout>
            <div className="container">
                <div className="page-header" style={{ textAlign: 'center' }}>
                    <h1>Контакты</h1>
                    <p>Свяжитесь с нами любым удобным способом</p>
                </div>

                <div className="contacts-content">
                    <div className="contact-info">
                        <div className="contact-card card">
                            <h3>Email</h3>
                            <p><a href="mailto:info@factory-gto.ru">info@factory-gto.ru</a></p>
                        </div>
                        <div className="contact-card card">
                            <h3>Время работы</h3>
                            <p>Пн-Пт: 9:00 – 18:00 (МСК)</p>
                        </div>
                        <div className="contact-card card">
                            <h3>Адрес</h3>
                            <p>Москва, Российская Федерация</p>
                        </div>
                    </div>

                    <div className="contact-form card">
                        <h2>Напишите нам</h2>
                        <p>Заполните форму обратной связи, и мы ответим вам в ближайшее время</p>

                        {submitted ? (
                            <div className="success-message">
                                <h3>Сообщение отправлено!</h3>
                                <p>Спасибо за обращение. Мы ответим вам в течение 24 часов.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="input-group">
                                    <label>Ваше имя</label>
                                    <input type="text" name="name" value={form.name} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Email</label>
                                    <input type="email" name="email" value={form.email} onChange={handleChange} required />
                                </div>
                                <div className="input-group">
                                    <label>Сообщение</label>
                                    <textarea name="message" value={form.message} onChange={handleChange} rows={5} required />
                                </div>
                                <div className="checkbox-group">
                                    <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} required />
                                    <label>Я согласен на обработку персональных данных</label>
                                </div>
                                <button type="submit" className="btn btn-primary">Отправить</button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .contacts-content {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 48px;
                    max-width: 1000px;
                    margin: 0 auto;
                    padding-bottom: 80px;
                }
                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .contact-card h3 {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                }
                .contact-card p {
                    font-size: 18px;
                    font-weight: 500;
                }
                .contact-card a {
                    color: var(--primary);
                }
                .contact-form h2 {
                    margin-bottom: 8px;
                }
                .contact-form > p {
                    color: var(--text-secondary);
                    margin-bottom: 32px;
                }
                .success-message {
                    text-align: center;
                    padding: 48px;
                    background: var(--cat-2);
                    border-radius: var(--radius-lg);
                }
                .success-message h3 {
                    color: #2E7D32;
                    margin-bottom: 8px;
                }
                @media (max-width: 768px) {
                    .contacts-content {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </MainLayout>
    );
}