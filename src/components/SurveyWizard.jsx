import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { surveys } from '../data/surveys';
import { CheckCircle, ArrowRight, ArrowLeft, Save, Check } from 'lucide-react';

const SurveyWizard = ({ onComplete, surveyId = 'adult' }) => {
    const survey = surveys.find(s => s.id === surveyId) || surveys[0];
    const questions = survey.questions;

    // Group questions by category
    const categories = questions.reduce((acc, q) => {
        if (!acc.includes(q.category)) {
            acc.push(q.category);
        }
        return acc;
    }, []);

    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Auto-load progress
    useEffect(() => {
        const savedProgress = localStorage.getItem(`survey_progress_${surveyId}`);
        if (savedProgress) {
            const { step, answers: savedAnswers } = JSON.parse(savedProgress);
            setCurrentStep(step || 0);
            setAnswers(savedAnswers || {});
        }
        setIsLoaded(true);
    }, [surveyId]);

    // Auto-save progress
    useEffect(() => {
        if (isLoaded && !isSubmitted) {
            localStorage.setItem(`survey_progress_${surveyId}`, JSON.stringify({
                step: currentStep,
                answers: answers
            }));
        }
    }, [currentStep, answers, isLoaded, isSubmitted, surveyId]);

    const totalSteps = categories.length;
    const currentCategory = categories[currentStep];
    const categoryQuestions = questions.filter(q => q.category === currentCategory);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            submitForm();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleInputChange = (id, value) => {
        setAnswers(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const submitForm = async () => {
        const formData = new FormData();
        formData.append('form-name', 'nutricionist-survey');
        formData.append('survey-title', survey.title);
        formData.append('survey-id', survey.id);

        Object.keys(answers).forEach(key => {
            const question = questions.find(q => q.id.toString() === key);
            const value = answers[key];
            if (Array.isArray(value)) {
                formData.append(`q${key}`, value.join(', '));
            } else {
                formData.append(`q${key}`, value);
            }
        });

        try {
            await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(formData).toString(),
            });

            // Store for admin view
            const existingSubmissions = JSON.parse(localStorage.getItem('survey_submissions') || '[]');
            existingSubmissions.push({
                date: new Date().toISOString(),
                surveyId: survey.id,
                surveyTitle: survey.title,
                answers: answers
            });
            localStorage.setItem('survey_submissions', JSON.stringify(existingSubmissions));

            // Clear progress
            localStorage.removeItem(`survey_progress_${surveyId}`);
            setIsSubmitted(true);
        } catch (error) {
            alert("Ошибка при отправке. Ваше состояние сохранено, попробуйте позже.");
        }
    };

    if (!isLoaded) return null;

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center py-20 bg-white rounded-3xl shadow-xl p-12"
            >
                <div className="w-20 h-20 bg-nutritionist-light/10 text-nutritionist-light rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-nutritionist-dark mb-4">Спасибо!</h2>
                <p className="text-nutritionist-dark/60 mb-8">
                    Ваши ответы успешно отправлены. Ольга свяжется с вами в ближайшее время.
                </p>
                <button
                    onClick={onComplete}
                    className="px-8 py-3 bg-nutritionist-dark text-white rounded-xl font-semibold hover:bg-nutritionist-medium transition-colors"
                >
                    Вернуться на главную
                </button>
            </motion.div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Progress and Category Title */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <span className="text-sm font-bold text-nutritionist-light uppercase tracking-wider block mb-1">
                            Раздел {currentStep + 1} из {totalSteps}
                        </span>
                        <h2 className="text-3xl font-black text-nutritionist-dark">{currentCategory}</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-nutritionist-dark/20">{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                    </div>
                </div>
                <div className="w-full h-3 bg-nutritionist-dark/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-nutritionist-light"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                        transition={{ type: "spring", stiffness: 50 }}
                    />
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-nutritionist-dark/40 font-medium">
                    <Save className="w-3 h-3" />
                    <span>Прогресс сохраняется автоматически</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-white rounded-[2rem] shadow-2xl shadow-nutritionist-dark/5 p-8 md:p-12 border border-nutritionist-dark/5"
                >
                    <div className="space-y-12">
                        {categoryQuestions.map((q) => (
                            <div key={q.id} className="group">
                                <label className="block text-xl font-bold text-nutritionist-dark mb-6 leading-tight group-focus-within:text-nutritionist-light transition-colors">
                                    {q.text}
                                    {q.required && <span className="text-red-400 ml-1">*</span>}
                                </label>
                                {q.type === 'text' ? (
                                    <input
                                        type="text"
                                        className="w-full p-0 pb-4 bg-transparent border-b-2 border-nutritionist-dark/10 focus:border-nutritionist-light outline-none text-lg md:text-xl transition-all font-medium text-nutritionist-dark placeholder:text-nutritionist-dark/20"
                                        placeholder="Введите ответ..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    />
                                ) : q.type === 'select' ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {q.options.map(option => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleInputChange(q.id, option)}
                                                className={`p-4 rounded-2xl border-2 transition-all font-bold text-lg ${answers[q.id] === option
                                                    ? 'border-nutritionist-light bg-nutritionist-light/5 text-nutritionist-light'
                                                    : 'border-nutritionist-dark/5 bg-slate-50 text-nutritionist-dark/40 hover:border-nutritionist-dark/10'
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                ) : q.type === 'checkbox_group' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {q.options.map(option => {
                                            const isChecked = (answers[q.id] || []).includes(option);
                                            return (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = answers[q.id] || [];
                                                        const next = isChecked
                                                            ? current.filter(i => i !== option)
                                                            : [...current, option];
                                                        handleInputChange(q.id, next);
                                                    }}
                                                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${isChecked
                                                        ? 'border-nutritionist-light bg-nutritionist-light/5 text-nutritionist-dark'
                                                        : 'border-nutritionist-dark/5 bg-slate-50 text-nutritionist-dark/40 hover:border-nutritionist-dark/10'
                                                        }`}
                                                >
                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-nutritionist-light border-nutritionist-light' : 'border-nutritionist-dark/10'
                                                        }`}>
                                                        {isChecked && <Check className="w-4 h-4 text-white" />}
                                                    </div>
                                                    <span className="font-semibold text-sm leading-tight">{option}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <textarea
                                        className="w-full p-6 bg-slate-50 border-2 border-transparent focus:border-nutritionist-light focus:bg-white rounded-3xl outline-none text-lg transition-all min-h-[160px] font-medium text-nutritionist-dark placeholder:text-nutritionist-dark/20 shrink-0"
                                        placeholder="Ваш подробный ответ..."
                                        value={answers[q.id] || ''}
                                        onChange={(e) => handleInputChange(q.id, e.target.value)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 flex flex-col-reverse sm:flex-row justify-between items-center gap-6">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-nutritionist-dark/40 font-black hover:text-nutritionist-dark transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : ''}`}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Назад
                        </button>
                        <button
                            onClick={handleNext}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 bg-nutritionist-dark text-white rounded-[1.25rem] font-black hover:bg-nutritionist-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-nutritionist-dark/20"
                        >
                            {currentStep === totalSteps - 1 ? 'Завершить опрос' : 'Следующий раздел'}
                            {currentStep !== totalSteps - 1 && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <form name="nutricionist-survey" data-netlify="true" hidden>
                <input type="hidden" name="survey-title" />
                <input type="hidden" name="survey-id" />
                {surveys.flatMap(s => s.questions).map(q => (
                    <input key={q.id} type="text" name={`q${q.id}`} />
                ))}
            </form>
        </div>
    );
};

export default SurveyWizard;
