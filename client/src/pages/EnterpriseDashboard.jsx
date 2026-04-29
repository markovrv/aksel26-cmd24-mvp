import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { api } from '../api';
import EditCaseModal from './EditCaseModal';

const CATEGORIES = [
    { value: 'school_8_9', label: 'Школьники 8–9 класс' },
    { value: 'school_10_11', label: 'Школьники 10–11 класс' },
    { value: 'spo', label: 'СПО / Колледж' },
    { value: 'university', label: 'Студенты ВУЗ' }
];

export default function EnterpriseDashboard() {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [cases, setCases] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('cases');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCase, setSelectedCase] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [editCase, setEditCase] = useState(null);

    useEffect(() => {
        if (user?.role === 'enterprise') {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [profileData, casesData, analyticsData] = await Promise.all([
                api.enterprise.getProfile(),
                api.enterprise.getCases(),
                api.enterprise.getAnalytics()
            ]);
            setProfile(profileData);
            setCases(casesData);
            setAnalytics(analyticsData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadSubmissions = async (caseId) => {
        try {
            const data = await api.enterprise.getSubmissions(caseId);
            setSubmissions(data);
            setSelectedCase(cases.find(c => c.id === caseId));
        } catch (err) {
            console.error(err);
        }
    };

    // Открыть модальное окно редактирования кейса
    const handleEditCase = (caseItem) => {
        setEditCase(caseItem);
    };

    // Удалить кейс с подтверждением
    const handleDeleteCase = async (caseId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот кейс?')) return;
        try {
            await api.enterprise.deleteCase(caseId);
            // Обновляем список после удаления
            loadData();
        } catch (err) {
            alert(err.message);
        }
    };

    if (authLoading) return <div className="loading">Загрузка...</div>;
    if (!user || user.role !== 'enterprise') return <Navigate to="/login" />;

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <>
            <Header />
            <main className="dashboard">
                <div className="container">
                    <div className="dashboard-header">
                        <h1>Кабинет предприятия</h1>
                        {profile?.moderation_status !== 'approved' && (
                            <div className="moderation-warning">
                                <span className="badge badge-pending">На модерации</span>
                                <p>Ваш профиль ожидает одобрения администратора</p>
                            </div>
                        )}
                    </div>

                    <div className="tabs">
                        <button className={activeTab === 'cases' ? 'active' : ''} onClick={() => setActiveTab('cases')}>Мои кейсы</button>
                        <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>Аналитика</button>
                    </div>

                    {activeTab === 'cases' && (
                        <div className="cases-section">
                            <div className="section-header">
                                <h2>Управление кейсами</h2>
                                {profile?.moderation_status === 'approved' && (
                                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">Создать кейс</button>
                                )}
                            </div>

                            <div className="cases-list">
                                {cases.length === 0 ? (
                                    <div className="empty-state">
                                        <p>У вас пока нет кейсов</p>
                                    </div>
                                ) : (
                                    cases.map(c => (
                                        <div key={c.id} className="case-item card">
                                            <div className="case-info">
                                                <div className="case-header">
                                                    <h3>{c.title}</h3>
                                                    <span className={`badge badge-${c.status}`}>{c.status === 'open' ? 'Открыт' : 'Закрыт'}</span>
                                                </div>
                                                <p className="case-desc">{c.short_description}</p>
                                                <div className="case-meta">
                                                    <span>Дедлайн: {new Date(c.deadline).toLocaleDateString('ru')}</span>
                                                    <span>{c.submission_count || 0} решений</span>
                                                    <span>{c.reviewed_count || 0} оценено</span>
                                                </div>
                                            </div>
                                            <div className="case-actions">
                                                <button onClick={() => loadSubmissions(c.id)} className="btn btn-secondary">Решения</button>
                                                <button onClick={() => handleEditCase(c)} className="btn btn-primary" style={{ marginLeft: '8px' }}>Редактировать</button>
                                                <button onClick={() => handleDeleteCase(c.id)} className="btn btn-danger" style={{ marginLeft: '8px' }}>Удалить</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'analytics' && analytics && (
                        <div className="analytics-section">
                            <div className="stats-grid">
                                <div className="stat-card card">
                                    <h3>Всего решений</h3>
                                    <span className="stat-number">{analytics.totalSubmissions}</span>
                                </div>
                            </div>

                            <div className="analytics-grid">
                                <div className="card">
                                    <h3>По регионам</h3>
                                    <div className="analytics-list">
                                        {analytics.regionStats?.length > 0 ? analytics.regionStats.map(r => (
                                            <div key={r.region} className="analytics-item">
                                                <span>{r.region || 'Не указан'}</span>
                                                <span>{r.count}</span>
                                            </div>
                                        )) : <p>Нет данных</p>}
                                    </div>
                                </div>
                                <div className="card">
                                    <h3>По категориям</h3>
                                    <div className="analytics-list">
                                        {analytics.categoryStats?.length > 0 ? analytics.categoryStats.map(c => (
                                            <div key={c.category} className="analytics-item">
                                                <span>{CATEGORIES.find(cat => cat.value === c.category)?.label || c.category}</span>
                                                <span>{c.count}</span>
                                            </div>
                                        )) : <p>Нет данных</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedCase && (
                        <div className="modal-overlay" onClick={() => setSelectedCase(null)}>
                            <div className="modal card" onClick={e => e.stopPropagation()}>
                                <h2>Решения: {selectedCase.title}</h2>
                                <div className="submissions-list">
                                    {submissions.length === 0 ? (
                                        <p>Нет решений</p>
                                    ) : submissions.map(sub => (
                                        <SubmissionItem key={sub.id} submission={sub} />
                                    ))}
                                </div>
                                <button onClick={() => setSelectedCase(null)} className="btn btn-secondary">Закрыть</button>
                            </div>
                        </div>
                    )}

                    {showCreateModal && (
                        <CreateCaseModal onClose={() => setShowCreateModal(false)} onCreated={loadData} />
                    )}
                    {editCase && (
                        <EditCaseModal caseData={editCase} onClose={() => setEditCase(null)} onUpdated={loadData} />
                    )}
                </div>
            </main>

            <style>{`
                .dashboard {
                    padding: 48px 0 80px;
                }
                .dashboard-header {
                    margin-bottom: 32px;
                }
                .moderation-warning {
                    margin-top: 16px;
                    padding: 16px;
                    background: #FFF4DF;
                    border-radius: var(--radius);
                }
                .moderation-warning p {
                    margin-top: 8px;
                    color: var(--text-secondary);
                }
                .tabs {
                    display: flex;
                    gap: 4px;
                    border-bottom: 2px solid var(--border);
                    margin-bottom: 32px;
                }
                .tabs button {
                    padding: 12px 24px;
                    background: none;
                    border: none;
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -2px;
                }
                .tabs button.active {
                    color: var(--primary);
                    border-bottom-color: var(--primary);
                }
                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .section-header h2 { margin: 0; }
                .cases-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .case-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .case-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 8px;
                }
                .case-desc {
                    color: var(--text-secondary);
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .case-meta {
                    display: flex;
                    gap: 24px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 24px;
                    margin-bottom: 32px;
                }
                .stat-card {
                    text-align: center;
                }
                .stat-card h3 {
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .stat-number {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--primary);
                }
                .analytics-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 24px;
                }
                .analytics-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .analytics-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px;
                    background: var(--background);
                    border-radius: var(--radius);
                }
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal {
                    max-width: 600px;
                    width: 90%;
                    max-height: 80vh;
                    overflow-y: auto;
                }
                .modal h2 {
                    margin-bottom: 24px;
                }
                .modal .submissions-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .analytics-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </>
    );
}

function SubmissionItem({ submission }) {
    const [evaluating, setEvaluating] = useState(false);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [scores, setScores] = useState({
        elaboration: 3,
        applicability: 3,
        originality: 3,
        technicalLogic: 3,
        presentation: 3,
        comment: ''
    });

    useEffect(() => {
        api.files.getSubmissionFiles(submission.id).then(setSubmissionFiles).catch(console.error);
    }, [submission.id]);

    const handleEvaluate = async () => {
        try {
            await api.enterprise.evaluate(submission.id, scores);
            alert('Оценка сохранена');
            setEvaluating(false);
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="submission-item">
            <div className="submission-info">
                <h4>{submission.full_name}</h4>
                <p className="submission-text">{submission.text_answer}</p>
                {submissionFiles.length > 0 && (
                    <div className="submission-files">
                        <span className="files-label">Файлы участника:</span>
                        {submissionFiles.map(f => (
                            <a key={f.id} href={api.files.getDownloadUrl(f.id, 'submission')} target="_blank" rel="noopener noreferrer" className="file-link">
                                📎 {f.original_name}
                            </a>
                        ))}
                    </div>
                )}
                {submission.contact_consent === 1 && (
                    <p className="contact-info">Контактные данные доступны</p>
                )}
                {submission.total_score && <p className="score-display">Оценка: {submission.total_score}</p>}
            </div>
            {!evaluating ? (
                <button onClick={() => setEvaluating(true)} className="btn btn-primary">Оценить</button>
            ) : (
                <div className="evaluation-form">
                    <div className="score-inputs">
                        {['elaboration', 'applicability', 'originality', 'technicalLogic', 'presentation'].map(key => (
                            <div key={key} className="input-group">
                                <label>{key === 'technicalLogic' ? 'Technical Logic' : key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <select value={scores[key]} onChange={e => setScores({ ...scores, [key]: parseInt(e.target.value) })}>
                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        ))}
                    </div>
                    <div className="input-group">
                        <label>Комментарий</label>
                        <textarea value={scores.comment} onChange={e => setScores({ ...scores, comment: e.target.value })} />
                    </div>
                    <div className="evaluation-buttons">
                        <button onClick={handleEvaluate} className="btn btn-primary">Сохранить</button>
                        <button onClick={() => setEvaluating(false)} className="btn btn-secondary">Отмена</button>
                    </div>
                </div>
            )}
            <style>{`
                .submission-item {
                    padding: 16px;
                    background: var(--background);
                    border-radius: var(--radius);
                }
                .submission-info {
                    margin-bottom: 16px;
                }
                .submission-info h4 {
                    margin-bottom: 8px;
                }
                .submission-text {
                    font-size: 14px;
                    color: var(--text-secondary);
                    white-space: pre-wrap;
                }
                .contact-info {
                    font-size: 12px;
                    color: var(--primary);
                    margin-top: 8px;
                }
                .score-display {
                    font-weight: 600;
                    color: var(--primary);
                    margin-top: 8px;
                }
                .submission-files {
                    margin-top: 12px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .files-label {
                    font-size: 12px;
                    color: var(--muted);
                    margin-bottom: 4px;
                }
                .file-link {
                    font-size: 13px;
                    color: var(--primary);
                }
                .evaluation-form {
                    margin-top: 16px;
                }
                .score-inputs {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                }
                .evaluation-buttons {
                    display: flex;
                    gap: 12px;
                }
            `}</style>
        </div>
    );
}

function CreateCaseModal({ onClose, onCreated }) {
    const [form, setForm] = useState({
        title: '',
        shortDescription: '',
        fullDescription: '',
        requirements: '',
        deadline: '',
        categories: []
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const caseData = await api.enterprise.createCase(form);
            if (files.length > 0 && caseData.id) {
                const fileFormData = new FormData();
                files.forEach(f => fileFormData.append('files', f));
                await api.files.uploadCaseFiles(caseData.id, fileFormData);
            }
            onCreated();
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleCategory = (cat) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <h2>Создать кейс</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Название</label>
                        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label>Краткое описание</label>
                        <textarea value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} rows={2} />
                    </div>
                    <div className="input-group">
                        <label>Полное описание</label>
                        <textarea value={form.fullDescription} onChange={e => setForm({ ...form, fullDescription: e.target.value })} rows={4} />
                    </div>
                    <div className="input-group">
                        <label>Требования</label>
                        <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={2} />
                    </div>
                    <div className="input-group">
                        <label>Дедлайн</label>
                        <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
                    </div>
                    <div className="input-group">
                        <label>Категории участников</label>
                        <div className="category-checkboxes">
                            {CATEGORIES.map(cat => (
                                <label key={cat.value} className="checkbox-label">
                                    <input type="checkbox" checked={form.categories.includes(cat.value)} onChange={() => toggleCategory(cat.value)} />
                                    {cat.label}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Материалы кейса</label>
                        <div
                            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('case-files-input').click()}
                        >
                            <p>Перетащите файлы сюда или кликните для выбора</p>
                            <p className="drop-hint">PDF, DOCX, PPTX, XLSX, TXT, ZIP (до 20 МБ каждый)</p>
                        </div>
                        <input
                            id="case-files-input"
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
                        />
                        {files.length > 0 && (
                            <div className="file-list">
                                {files.map((f, i) => (
                                    <div key={i} className="file-item">
                                        <span>{f.name}</span>
                                        <button type="button" onClick={() => removeFile(i)}>×</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Создание...' : 'Создать кейс'}
                    </button>
                </form>
                <style>{`
                    .category-checkboxes {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .checkbox-label {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .drop-zone {
                        border: 2px dashed var(--border);
                        border-radius: var(--radius);
                        padding: 24px;
                        text-align: center;
                        cursor: pointer;
                        transition: all 0.2s;
                    }
                    .drop-zone:hover, .drop-zone.drag-active {
                        border-color: var(--primary);
                        background: rgba(31, 99, 214, 0.05);
                    }
                    .drop-zone p {
                        margin: 0;
                        color: var(--muted);
                    }
                    .drop-hint {
                        font-size: 12px;
                        margin-top: 4px;
                    }
                    .file-list {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                        margin-top: 12px;
                    }
                    .file-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 12px;
                        background: var(--background);
                        border-radius: var(--radius-sm);
                        font-size: 14px;
                    }
                    .file-item button {
                        background: none;
                        border: none;
                        color: var(--muted);
                        font-size: 18px;
                        cursor: pointer;
                    }
                `}</style>
            </div>
        </div>
    );
}