const API_BASE = '/api';

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers
        },
        ...options
    };

    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    } else if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Ошибка сервера');
    }

    return data;
}

export const api = {
    auth: {
        register: (data) => request('/auth/register', { method: 'POST', body: data }),
        login: (data) => request('/auth/login', { method: 'POST', body: data }),
        me: () => request('/auth/me')
    },

    cases: {
        list: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/cases${query ? `?${query}` : ''}`);
        },
        get: (id) => request(`/cases/${id}`)
    },

    enterprises: {
        list: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/enterprises${query ? `?${query}` : ''}`);
        },
        get: (id) => request(`/enterprises/${id}`)
    },

    rating: {
        list: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/rating${query ? `?${query}` : ''}`);
        }
    },

    news: {
        list: () => request('/news'),
        get: (id) => request(`/news/${id}`)
    },

    participant: {
        getProfile: () => request('/participant/profile'),
        updateProfile: (data) => request('/participant/profile', { method: 'PUT', body: data }),
        getSubmissions: () => request('/participant/submissions'),
        createSubmission: (data) => {
            const formData = new FormData();
            formData.append('caseId', data.caseId);
            formData.append('textAnswer', data.textAnswer || '');
            formData.append('consent', 'true');
            return request('/participant/submissions', { method: 'POST', body: formData });
        },
        updateSubmission: (id, data) => request(`/participant/submissions/${id}`, { method: 'PUT', body: data })
    },

    enterprise: {
        getProfile: () => request('/enterprise/profile'),
        updateProfile: (data) => request('/enterprise/profile', { method: 'PUT', body: data }),
        getCases: () => request('/enterprise/cases'),
        createCase: (data) => {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'categories') {
                    data.categories.forEach(c => formData.append('categories', c));
                } else {
                    formData.append(key, data[key]);
                }
            });
            return request('/enterprise/cases', { method: 'POST', body: formData });
        },
        updateCase: (id, data) => {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key === 'categories') {
                    data.categories.forEach(c => formData.append('categories', c));
                } else {
                    formData.append(key, data[key]);
                }
            });
            return request(`/enterprise/cases/${id}`, { method: 'PUT', body: formData });
        },
        deleteCase: (id) => request(`/enterprise/cases/${id}`, { method: 'DELETE' }),
        getSubmissions: (caseId) => request(`/enterprise/cases/${caseId}/submissions`),
        evaluate: (submissionId, data) => request(`/enterprise/submissions/${submissionId}/evaluate`, { method: 'POST', body: data }),
        getAnalytics: () => request('/enterprise/analytics')
    },

    admin: {
        getUsers: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/admin/users${query ? `?${query}` : ''}`);
        },
        getEnterprises: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/admin/enterprises${query ? `?${query}` : ''}`);
        },
        moderateEnterprise: (id, status) => request(`/admin/enterprises/${id}/moderate`, { method: 'PATCH', body: { status } }),
        getCases: (params) => {
            const query = new URLSearchParams(params).toString();
            return request(`/admin/cases${query ? `?${query}` : ''}`);
        },
        changeCaseStatus: (id, status) => request(`/admin/cases/${id}/status`, { method: 'PATCH', body: { status } }),
        // news management endpoints
        getNews: () => request('/news'),
        createNews: (data) => request('/admin/news', { method: 'POST', body: data }),
        updateNews: (id, data) => request(`/admin/news/${id}`, { method: 'PUT', body: data }),
        deleteNews: (id) => request(`/admin/news/${id}`, { method: 'DELETE' }),
        getStats: () => request('/admin/stats')
    },

    files: {
        uploadCaseFiles: (caseId, formData) => {
            const token = localStorage.getItem('token');
            return fetch(`${API_BASE}/files/case-files/${caseId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            }).then(r => r.json());
        },
        uploadSubmissionFiles: (submissionId, formData) => {
            const token = localStorage.getItem('token');
            return fetch(`${API_BASE}/files/submission-files/${submissionId}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            }).then(r => r.json());
        },
        getCaseFiles: (caseId) => request(`/files/case-files/${caseId}`),
        getSubmissionFiles: (submissionId) => request(`/files/submission-files/${submissionId}`),
        deleteFile: (fileId, type) => {
            const token = localStorage.getItem('token');
            return fetch(`${API_BASE}/files/${fileId}?type=${type}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json());
        },
        getDownloadUrl: (fileId, type) => `${API_BASE}/files/${fileId}/download?type=${type}`
    }
};