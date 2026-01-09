import React, { useState, useEffect } from 'react';
import { surveys } from '../data/surveys';
import { Clock, User, Mail, MessageSquare, Download, ChevronRight, FileText, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { arialBase64 } from '../utils/arialFont';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_password');
        if (saved) {
            setPassword(saved);
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadSubmissions();
        }
    }, [isAuthenticated]);

    const loadSubmissions = async () => {
        setIsLoading(true);
        setError(null);
        const authPassword = password || sessionStorage.getItem('admin_password');

        try {
            const response = await fetch('/.netlify/functions/get-submissions', {
                headers: {
                    'Authorization': `Bearer ${authPassword}`
                }
            });
            if (!response.ok) {
                if (response.status === 401) throw new Error('Wrong password');
                throw new Error(`Server error: ${response.status}`);
            }
            const data = await response.json();
            setSubmissions(data);
        } catch (err) {
            setError(err.message);
            if (err.message === 'Wrong password') {
                setIsAuthenticated(false);
                sessionStorage.removeItem('admin_password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        sessionStorage.setItem('admin_password', password);
        setIsAuthenticated(true);
        // loadSubmissions will be triggered by useEffect
    };

    const [deletingId, setDeletingId] = useState(null);

    const deleteSubmission = async (submissionToDelete) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту анкету? Это действие нельзя отменить.')) return;

        setDeletingId(submissionToDelete.id);
        const authPassword = password || sessionStorage.getItem('admin_password');

        try {
            const response = await fetch(`/.netlify/functions/get-submissions?id=${submissionToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authPassword}`
                }
            });

            if (response.status === 204 || response.ok) {
                // Success - remove from local list
                setSubmissions(prev => prev.filter(s => s.id !== submissionToDelete.id));
                if (selectedSubmission?.id === submissionToDelete.id) {
                    setSelectedSubmission(null);
                }
            } else {
                let errorMsg = response.statusText;
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errorMsg;
                } catch (e) { }
                alert(`Ошибка сервера при удалении (${response.status}): ${errorMsg}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Ошибка сети или сервера. Не удалось удалить анкету.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAnswer = (submission, qId) => {
        return submission.answers[qId] || '—';
    };

    const getDisplayName = (submission) => {
        if (submission.surveyId === 'child') {
            return `${getAnswer(submission, 101)} / ${getAnswer(submission, 102)}`;
        }
        return `${getAnswer(submission, 1)} ${getAnswer(submission, 2)}`;
    };

    const getDisplayEmail = (submission) => {
        if (submission.surveyId === 'child') {
            return getAnswer(submission, 103);
        }
        return getAnswer(submission, 3);
    };

    const getSurvey = (surveyId) => {
        return surveys.find(s => s.id === (surveyId || 'adult')) || surveys[0];
    };

    const exportPDF = () => {
        if (!selectedSubmission) return;
        const selectedSurvey = getSurvey(selectedSubmission.surveyId);
        if (!selectedSurvey) return;

        const doc = jsPDF();
        doc.addFileToVFS('Arial.ttf', arialBase64);
        doc.addFont('Arial.ttf', 'Arial', 'normal', 'Identity-H');
        doc.setFont('Arial');

        const surveyName = selectedSubmission.surveyTitle || selectedSurvey.title;
        const respondentName = getDisplayName(selectedSubmission);

        doc.setFontSize(20);
        doc.text(surveyName, 14, 22);
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Подопечный: ${respondentName}`, 14, 30);
        doc.text(`Дата: ${formatDate(selectedSubmission.date)}`, 14, 36);

        let currentY = 45;
        const categories = [...new Set(selectedSurvey.questions.map(q => q.category))];

        categories.forEach(cat => {
            const catQuestions = selectedSurvey.questions.filter(q => q.category === cat);
            const rows = catQuestions.map(q => {
                const answer = getAnswer(selectedSubmission, q.id);
                return [q.text, Array.isArray(answer) ? answer.join(', ') : answer];
            });

            autoTable(doc, {
                startY: currentY,
                head: [[{ content: cat, colSpan: 2, styles: { fillColor: [45, 90, 39], halign: 'left', font: 'Arial', fontStyle: 'normal' } }]],
                body: rows,
                theme: 'striped',
                headStyles: { fontSize: 10, font: 'Arial', fontStyle: 'normal' },
                bodyStyles: { fontSize: 9, font: 'Arial', fontStyle: 'normal' },
                styles: { font: 'Arial', fontStyle: 'normal' },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 'auto' }
                },
                margin: { top: 10 }
            });

            currentY = doc.lastAutoTable.finalY + 10;
        });

        const filename = `${respondentName.replace(/\s+/g, '_')}_${selectedSubmission.surveyId}.pdf`;
        doc.save(filename);
    };

    const selectedSurvey = selectedSubmission ? getSurvey(selectedSubmission.surveyId) : null;
    const categories = selectedSurvey ? [...new Set(selectedSurvey.questions.map(q => q.category))] : [];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 w-full max-w-md"
                >
                    <div className="w-20 h-20 bg-nutritionist-light/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
                        <User className="w-10 h-10 text-nutritionist-light" />
                    </div>
                    <h2 className="text-3xl font-black text-white text-center mb-2">Вход в панель</h2>
                    <p className="text-white/40 text-center mb-8 font-medium">Введите пароль администратора</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Пароль"
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-nutritionist-light transition-all"
                            autoFocus
                        />
                        {error && <p className="text-red-400 text-sm font-bold text-center">{error === 'Wrong password' ? 'Неверный пароль' : error}</p>}
                        <button
                            type="submit"
                            className="w-full py-4 bg-nutritionist-light text-white rounded-2xl font-black hover:bg-nutritionist-medium transition-all active:scale-95 shadow-lg shadow-nutritionist-light/20"
                        >
                            Войти
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-montserrat">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Приватная сводка</h1>
                        <p className="text-slate-500 font-medium">Ответы со всех устройств (Netlify Cloud)</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={loadSubmissions}
                            className="p-3 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:text-nutritionist-light transition-all shadow-sm"
                            title="Обновить данные"
                        >
                            <Clock className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => window.location.hash = ''}
                            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all shadow-sm font-bold active:scale-95"
                        >
                            Выйти
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-4">
                        <div className="flex items-center justify-between px-2 mb-2">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Все анкеты</h2>
                            <span className="bg-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">{submissions.length}</span>
                        </div>
                        {isLoading && submissions.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
                                <div className="w-10 h-10 border-4 border-nutritionist-light border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-slate-400 font-bold tracking-tight">Загрузка данных...</p>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center text-slate-400">
                                <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-20" />
                                <p className="font-bold">Пока нет ответов</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {submissions.map((sub, idx) => (
                                    <div
                                        key={sub.id || idx}
                                        onClick={() => setSelectedSubmission(sub)}
                                        className={`w-full text-left p-6 rounded-[2rem] border transition-all relative overflow-hidden group cursor-pointer ${selectedSubmission === sub
                                            ? 'bg-nutritionist-dark text-white border-nutritionist-dark shadow-2xl shadow-nutritionist-dark/20'
                                            : 'bg-white text-slate-600 border-slate-100 hover:border-nutritionist-light hover:shadow-xl hover:shadow-slate-200/50'
                                            }`}
                                    >
                                        <div className="relative z-10 pr-12">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSubmission === sub ? 'bg-white/10' : 'bg-slate-50 text-slate-400'}`}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <span className="font-black truncate block text-lg">
                                                        {getDisplayName(sub)}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-xs opacity-60 font-bold uppercase tracking-wider">
                                                        {sub.surveyTitle || 'Анкета'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] opacity-40 font-bold uppercase tracking-wider mt-0.5">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(sub.date)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 text-sm font-medium p-2 rounded-xl ${selectedSubmission === sub ? 'bg-white/5 text-white/80' : 'bg-slate-50 text-slate-400'}`}>
                                                {sub.surveyId === 'child' ? <FileText className="w-4 h-4 shrink-0" /> : <Mail className="w-4 h-4 shrink-0" />}
                                                <span className="truncate">{getDisplayEmail(sub)}</span>
                                            </div>
                                        </div>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 z-20">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteSubmission(sub);
                                                }}
                                                disabled={deletingId === sub.id}
                                                className={`p-3 rounded-xl transition-all hover:scale-110 active:scale-95 ${deletingId === sub.id ? 'opacity-50 cursor-not-allowed' :
                                                    selectedSubmission === sub ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-slate-200 hover:text-red-500 hover:bg-red-50'
                                                    }`}
                                                title="Удалить анкету"
                                            >
                                                {deletingId === sub.id ? (
                                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                            </button>
                                            <ChevronRight className={`w-5 h-5 transition-transform ${selectedSubmission === sub ? 'text-white/40' : 'text-slate-200 group-hover:translate-x-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-8">
                        {selectedSubmission ? (
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden flex flex-col h-[85vh]">
                                <div className="p-8 md:p-10 border-b border-slate-50 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                                    <div>
                                        <div className="flex items-center gap-2 text-nutritionist-light text-xs font-black uppercase tracking-widest mb-1.5">
                                            <div className="w-2 h-2 rounded-full bg-nutritionist-light animate-pulse" />
                                            Просмотр анкеты
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                            {getDisplayName(selectedSubmission)}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={exportPDF}
                                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10 shrink-0"
                                    >
                                        <Download className="w-4 h-4" />
                                        Экспорт PDF
                                    </button>
                                </div>
                                <div className="flex-1 p-8 md:p-10 space-y-12 overflow-y-auto custom-scrollbar">
                                    {categories.map(cat => {
                                        const catQuestions = selectedSurvey.questions.filter(q => q.category === cat);
                                        return (
                                            <div key={cat} className="space-y-6">
                                                <div className="flex items-center gap-4">
                                                    <h4 className="text-sm font-black text-nutritionist-light uppercase tracking-[0.2em] whitespace-nowrap">{cat}</h4>
                                                    <div className="h-px bg-slate-100 w-full" />
                                                </div>
                                                <div className="grid gap-6">
                                                    {catQuestions.map(q => (
                                                        <div key={q.id} className="group">
                                                            <div className="flex items-start gap-4 mb-3">
                                                                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-nutritionist-light/10 group-hover:text-nutritionist-light group-hover:border-nutritionist-light/20 transition-all">
                                                                    {q.id}
                                                                </span>
                                                                <h5 className="text-xs font-black text-slate-400 group-hover:text-slate-600 transition-colors mt-2 uppercase tracking-wider">
                                                                    {q.text}
                                                                </h5>
                                                            </div>
                                                            <div className="pl-12">
                                                                <div className="text-lg text-slate-800 font-semibold leading-relaxed bg-slate-50/50 p-6 rounded-3xl border-2 border-transparent group-hover:border-slate-100 group-hover:bg-white transition-all shadow-sm group-hover:shadow-md">
                                                                    {Array.isArray(getAnswer(selectedSubmission, q.id))
                                                                        ? getAnswer(selectedSubmission, q.id).join(', ')
                                                                        : getAnswer(selectedSubmission, q.id)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400 p-12 text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6">
                                    <MessageSquare className="w-10 h-10 opacity-20" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Анкета не выбрана</h3>
                                <p className="max-w-xs font-medium">Выберите анкету из списка слева, чтобы просмотреть подробные ответы подопечного.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
