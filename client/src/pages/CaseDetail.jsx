import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { api } from '../api';
import { useAuth } from '../hooks/useAuth';

const CATEGORY_LABELS = {
    school_8_9: 'Школьники 8–9 класс',
    school_10_11: 'Школьники 10–11 класс',
    spo: 'СПО / Колледж',
    university: 'Студенты ВУЗ'
};

export default function CaseDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [caseItem, setCaseItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [textAnswer, setTextAnswer] = useState('');
    const [error, setError] = useState('');
    const [caseFiles, setCaseFiles] = useState([]);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [uploadDragActive, setUploadDragActive] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [existingSubmission, setExistingSubmission] = useState(null);

    useEffect(() => {
        loadCase();
        loadCaseFiles();
    }, [id]);

    const loadCase = async () => {
        try {
            const data = await api.cases.get(id);
            setCaseItem(data);
            if (user?.role === 'participant') {
                loadSubmission(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadCaseFiles = async () => {
        try {
            const files = await api.files.getCaseFiles(id);
            setCaseFiles(files);
        } catch (err) {
            console.error(err);
        }
    };

    const loadSubmission = async (caseData) => {
        try {
            const submissions = await api.participant.getSubmissions();
            const mySubmission = submissions.find(s => s.case_id === parseInt(id));
            if (mySubmission) {
                setExistingSubmission(mySubmission);
                const files = await api.files.getSubmissionFiles(mySubmission.id);
                setSubmissionFiles(files);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setUploadDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadSubmissionFiles = async (submissionId) => {
        if (selectedFiles.length === 0) return;
        setUploadingFiles(true);
        try {
            const formData = new FormData();
            selectedFiles.forEach(file => formData.append('files', file));
            await api.files.uploadSubmissionFiles(submissionId, formData);
            const files = await api.files.getSubmissionFiles(submissionId);
            setSubmissionFiles(files);
            setSelectedFiles([]);
        } catch (err) {
            console.error(err);
            alert('Ошибка загрузки файлов');
        } finally {
            setUploadingFiles(false);
        }
    };

    const deleteSubmissionFile = async (fileId) => {
        try {
            await api.files.deleteFile(fileId, 'submission');
            setSubmissionFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (err) {
            console.error(err);
            alert('Ошибка удаления файла');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const submission = await api.participant.createSubmission({
                caseId: parseInt(id),
                textAnswer
            });
            setExistingSubmission(submission);
            await uploadSubmissionFiles(submission.id);
            alert('Решение отправлено!');
            setTextAnswer('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="loading">Загрузка...</div>
            </MainLayout>
        );
    }

    if (!caseItem) {
        return (
            <MainLayout>
                <div className="empty-state">
                    <h3>Кейс не найден</h3>
                    <Link to="/cases" className="btn btn-secondary">Вернуться к списку</Link>
                </div>
            </MainLayout>
        );
    }

    const isDeadlinePassed = new Date(caseItem.deadline) < new Date();
    const canSubmit = user?.role === 'participant' && caseItem.status === 'open' && !isDeadlinePassed;

    return (
        <MainLayout>
            <div className="container">
                <div className="case-detail">
                    <div className="case-main">
                        <div className="case-header">
                            <span className={`badge badge-${caseItem.status}`}>
                                {caseItem.status === 'open' ? 'Открыт' : 'Закрыт'}
                            </span>
                            <Link to={`/enterprises/${caseItem.enterprise_id}`} className="enterprise-link">
                                {caseItem.enterprise_name}
                            </Link>
                        </div>

                        <h1>{caseItem.title}</h1>

                        <div className="case-meta">
                            <div className="meta-item">
                                <span className="meta-label">Дедлайн:</span>
                                <span className={`meta-value ${isDeadlinePassed ? 'passed' : ''}`}>
                                    {new Date(caseItem.deadline).toLocaleDateString('ru')}
                                </span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Регион:</span>
                                <span className="meta-value">{caseItem.enterprise_region}</span>
                            </div>
                        </div>

                        <div className="case-section">
                            <h2>Описание</h2>
                            <p className="description">{caseItem.full_description}</p>
                        </div>

                        <div className="case-section">
                            <h2>Требования</h2>
                            <p className="requirements">{caseItem.requirements}</p>
                        </div>

                        {caseItem.categories?.length > 0 && (
                            <div className="case-section">
                                <h2>Категории участников</h2>
                                <div className="categories-list">
                                    {caseItem.categories.map(cat => (
                                        <span key={cat} className="category-badge">{CATEGORY_LABELS[cat] || cat}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {caseFiles.length > 0 && (
                            <div className="case-section">
                                <h2>Материалы</h2>
                                <div className="files-list">
                                    {caseFiles.map(file => (
                                        <a key={file.id} href={api.files.getDownloadUrl(file.id, 'case')} target="_blank" rel="noopener noreferrer" className="file-item">
                                            📄 {file.original_name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="case-sidebar">
                        {canSubmit ? (
                            <div className="submit-form card">
                                <h3>Отправить решение</h3>
                                {error && <div className="error-message">{error}</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="input-group">
                                        <label>Текст решения</label>
                                        <textarea value={textAnswer} onChange={e => setTextAnswer(e.target.value)} rows={8} required />
                                    </div>

                                    <div
                                        className={`upload-dropzone ${uploadDragActive ? 'drag-active' : ''}`}
                                        onDragEnter={() => setUploadDragActive(true)}
                                        onDragLeave={() => setUploadDragActive(false)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleFileDrop}
                                        onClick={() => document.getElementById('submission-file-input').click()}
                                    >
                                        <span>Перетащите файлы или нажмите для выбора</span>
                                        <input
                                            id="submission-file-input"
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {selectedFiles.length > 0 && (
                                        <div className="selected-files">
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="selected-file">
                                                    <span>📄 {file.name}</span>
                                                    <button type="button" onClick={() => removeSelectedFile(index)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button type="submit" className="btn btn-primary" disabled={submitting || uploadingFiles} style={{ width: '100%' }}>
                                        {submitting ? 'Отправка...' : 'Отправить решение'}
                                    </button>
                                </form>
                            </div>
                        ) : !user ? (
                            <div className="auth-prompt card">
                                <h3>Хотите участвовать?</h3>
                                <p>Войдите или зарегистрируйтесь, чтобы отправить решение</p>
                                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Войти</Link>
                                <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>Регистрация</Link>
                            </div>
                        ) : existingSubmission ? (
                            <div className="card">
                                <h3>Ваше решение</h3>
                                <p className="submission-status">Статус: {existingSubmission.status}</p>
                                {submissionFiles.length > 0 && (
                                    <div className="submission-files">
                                        <h4>Прикреплённые файлы:</h4>
                                        {submissionFiles.map(file => (
                                            <div key={file.id} className="submission-file-item">
                                                <a href={api.files.getDownloadUrl(file.id, 'submission')} target="_blank" rel="noopener noreferrer">
                                                    📄 {file.original_name}
                                                </a>
                                                {!isDeadlinePassed && (
                                                    <button type="button" onClick={() => deleteSubmissionFile(file.id)} className="file-delete-btn">×</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!isDeadlinePassed && (
                                    <div className="upload-section">
                                        <div
                                            className={`upload-dropzone small ${uploadDragActive ? 'drag-active' : ''}`}
                                            onDragEnter={() => setUploadDragActive(true)}
                                            onDragLeave={() => setUploadDragActive(false)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleFileDrop}
                                            onClick={() => document.getElementById('additional-file-input').click()}
                                        >
                                            <span>Добавить файлы</span>
                                            <input
                                                id="additional-file-input"
                                                type="file"
                                                multiple
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                            />
                                        </div>
                                        {selectedFiles.length > 0 && (
                                            <div className="selected-files">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="selected-file">
                                                        <span>📄 {file.name}</span>
                                                        <button type="button" onClick={() => removeSelectedFile(index)}>×</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {selectedFiles.length > 0 && (
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => uploadSubmissionFiles(existingSubmission.id)}
                                                disabled={uploadingFiles}
                                                style={{ width: '100%', marginTop: '8px' }}
                                            >
                                                {uploadingFiles ? 'Загрузка...' : 'Загрузить файлы'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="closed-notice card">
                                <h3>Приём решений завершён</h3>
                                <p>Кейс закрыт или дедлайн истёк</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .case-detail {
                    display: grid;
                    grid-template-columns: 1fr 360px;
                    gap: 48px;
                    padding: 48px 0 80px;
                }
                .case-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .enterprise-link {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
                .case-main h1 {
                    margin-bottom: 24px;
                }
                .case-meta {
                    display: flex;
                    gap: 32px;
                    margin-bottom: 32px;
                    padding: 16px;
                    background: var(--background);
                    border-radius: var(--radius);
                }
                .meta-item {
                    display: flex;
                    gap: 8px;
                }
                .meta-label {
                    color: var(--text-secondary);
                }
                .meta-value.passed {
                    color: #C62828;
                }
                .case-section {
                    margin-bottom: 32px;
                }
                .case-section h2 {
                    font-size: 20px;
                    margin-bottom: 16px;
                }
                .description, .requirements {
                    white-space: pre-line;
                    line-height: 1.7;
                }
                .categories-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .category-badge {
                    padding: 8px 16px;
                    background: var(--cat-1);
                    border-radius: 20px;
                    font-size: 14px;
                }
                .files-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .file-item {
                    padding: 12px 16px;
                    background: var(--background);
                    border-radius: var(--radius);
                    color: var(--primary);
                }
                .case-sidebar {
                    position: sticky;
                    top: 96px;
                    height: fit-content;
                }
                .submit-form h3, .auth-prompt h3, .closed-notice h3 {
                    margin-bottom: 16px;
                }
                .submit-form form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .auth-prompt {
                    text-align: center;
                }
                .auth-prompt p {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }
                .auth-prompt .btn {
                    margin-bottom: 8px;
                }
                .closed-notice {
                    text-align: center;
                }
                .closed-notice p {
                    color: var(--text-secondary);
                }
                .error-message {
                    background: #FEE2E2;
                    color: #C62828;
                    padding: 12px 16px;
                    border-radius: var(--radius);
                    margin-bottom: 16px;
                    font-size: 14px;
                }
                .upload-dropzone {
                    border: 2px dashed var(--border);
                    border-radius: var(--radius);
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.2s;
                    margin-bottom: 12px;
                }
                .upload-dropzone:hover, .upload-dropzone.drag-active {
                    border-color: var(--primary);
                    background: rgba(31, 99, 214, 0.05);
                }
                .upload-dropzone.small {
                    padding: 12px;
                    font-size: 14px;
                }
                .selected-files {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                .selected-file {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--background);
                    border-radius: var(--radius);
                    font-size: 14px;
                }
                .selected-file button {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: var(--text-secondary);
                }
                .selected-file button:hover {
                    color: #C62828;
                }
                .submission-status {
                    color: var(--text-secondary);
                    margin-bottom: 16px;
                }
                .submission-files {
                    margin: 16px 0;
                }
                .submission-files h4 {
                    font-size: 14px;
                    margin-bottom: 8px;
                }
                .submission-file-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: var(--background);
                    border-radius: var(--radius);
                    margin-bottom: 8px;
                }
                .submission-file-item a {
                    color: var(--primary);
                    font-size: 14px;
                }
                .file-delete-btn {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: var(--text-secondary);
                    padding: 0 8px;
                }
                .file-delete-btn:hover {
                    color: #C62828;
                }
                .upload-section {
                    margin-top: 16px;
                }
                @media (max-width: 1024px) {
                    .case-detail {
                        grid-template-columns: 1fr;
                    }
                    .case-sidebar {
                        position: static;
                    }
                }
            `}</style>
        </MainLayout>
    );
}