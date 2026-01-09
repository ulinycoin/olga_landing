import React, { useState } from 'react';
import Hero from './components/Hero';
import SurveyWizard from './components/SurveyWizard';
import ContactSection from './components/ContactSection';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [showSurvey, setShowSurvey] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState('adult');
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');

  // Listen for hash change to toggle admin view
  React.useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen font-montserrat text-nutritionist-dark selection:bg-nutritionist-light/30">
      {!showSurvey ? (
        <>
          <Hero onStartSurvey={(id) => {
            setSelectedSurveyId(id);
            setShowSurvey(true);
          }} />
          <ContactSection />
          <footer className="py-8 text-center text-nutritionist-dark/50 text-sm">
            <p>© 2026 Ольга Жегалина. Все права защищены.</p>
            <p className="mt-1">Разработано SIA "ul-coin"</p>
          </footer>
        </>
      ) : (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowSurvey(false)}
            className="mb-8 flex items-center gap-2 text-nutritionist-medium hover:text-nutritionist-dark transition-colors"
          >
            ← Вернуться на главную
          </button>
          <SurveyWizard
            surveyId={selectedSurveyId}
            onComplete={() => setShowSurvey(false)}
          />
        </div>
      )}
    </div>
  );
}

export default App;
