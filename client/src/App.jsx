import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Enterprises from './pages/Enterprises';
import EnterpriseDetail from './pages/EnterpriseDetail';
import Rating from './pages/Rating';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Contacts from './pages/Contacts';
import Login from './pages/Login';
import Register from './pages/Register';
import ParticipantDashboard from './pages/ParticipantDashboard';
import EnterpriseDashboard from './pages/EnterpriseDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/enterprises" element={<Enterprises />} />
                <Route path="/enterprises/:id" element={<EnterpriseDetail />} />
                <Route path="/rating" element={<Rating />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/participant" element={<ParticipantDashboard />} />
                <Route path="/enterprise" element={<EnterpriseDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
    );
}