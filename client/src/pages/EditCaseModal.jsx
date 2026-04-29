import { useState, useEffect } from 'react';
import { api } from '../api';

// Дублируем список категорий, так как он не экспортируется из EnterpriseDashboard
const CATEGORIES = [
    { value: 'school_8_9', label: 'Школьники 8–9 класс' },
    { value: 'school_10_11', label: 'Школьники 10–11 класс' },
    { value: 'spo', label: 'СПО / Колледж' },
    { value: 'university', label: 'Студенты ВУЗ' }
];

export default function EditCaseModal({ caseData, onClose, onUpdated }) {
    // Ensure categories are an array of values for checkbox handling
    const initialCategories = (() => {
        const cats = caseData.categories;
        if (Array.isArray(cats)) return cats;
        if (typeof cats === 'string' && cats.length > 0) {
            // Assume comma‑separated string
            return cats.split(',').map(c => c.trim()).filter(Boolean);
        }
        return [];
    })();

    const [form, setForm] = useState({
        title: caseData.title || '',
        shortDescription: caseData.short_description || '',
        fullDescription: caseData.full_description || '',
        requirements: caseData.requirements || '',
        deadline: caseData.deadline ? caseData.deadline.split('T')[0] : '',
        categories: initialCategories
    });
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.enterprise.updateCase(caseData.id, form);
            // upload new files if any
            if (files.length > 0) {
                const formData = new FormData();
                files.forEach(f => formData.append('files', f));
                await api.files.uploadCaseFiles(caseData.id, formData);
            }
            onUpdated();
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleCategory = (cat) => {
        setForm(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    // Load existing files when modal opens
    useEffect(() => {
        const loadFiles = async () => {
            try {
                const data = await api.files.getCaseFiles(caseData.id);
                setExistingFiles(data);
            } catch (err) {
                console.error('Failed to load case files', err);
            }
        };
        loadFiles();
    }, [caseData.id]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        const dropped = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...dropped]);
    };

    const removeNewFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const deleteExistingFile = async (fileId) => {
        if (!window.confirm('Удалить файл?')) return;
        try {
            await api.files.deleteFile(fileId, 'case');
            setExistingFiles(prev => prev.filter(f => f.id !== fileId));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal card" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <h2>Редактировать кейс</h2>
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

                    {/* Existing files */}
                    {existingFiles.length > 0 && (
                        <div className="input-group">
                            <label>Текущие файлы</label>
                            <ul className="file-list">
                                {existingFiles.map(f => (
                                    <li key={f.id} className="file-item">
                                        <span>{f.original_name}</span>
                                        <button type="button" onClick={() => deleteExistingFile(f.id)} className="btn btn-danger btn-sm">Удалить</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* New files drop zone */}
                    <div className="input-group">
                        <label>Материалы кейса</label>
                        <div
                            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('edit-case-files-input').click()}
                        >
                            <p>Перетащите файлы сюда или кликните для выбора</p>
                            <p className="drop-hint">PDF, DOCX, PPTX, XLSX, TXT, ZIP (до 20 МБ каждый)</p>
                        </div>
                        <input
                            id="edit-case-files-input"
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files)])}
                        />
                        {files.length > 0 && (
                            <ul className="file-list new-files">
                                {files.map((f, i) => (
                                    <li key={i} className="file-item">
                                        <span>{f.name}</span>
                                        <button type="button" onClick={() => removeNewFile(i)} className="btn btn-secondary btn-sm">×</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </form>
                <style>{`
                    .category-checkboxes { display: flex; flex-direction: column; gap: 8px; }
                    .checkbox-label { display: flex; align-items: center; gap: 8px; }
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
                    .drop-zone p { margin: 0; }

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

                    .file-list { list-style: none; padding: 0; margin-top: 8px; }
                    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
                `}</style>
            </div>
        </div>
    );
}
