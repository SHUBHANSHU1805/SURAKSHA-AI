import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFIR } from '../hooks/useFIR';
import Analytics from '../components/Analytics/Analytics';

const AnalyticsPage = () => {
  const { t } = useTranslation();
  const { loadFIRs } = useFIR();
  const [darkMode, setDarkMode] = React.useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    loadFIRs();
    
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('analytics.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Crime statistics and trends analysis
        </p>
      </div>

      {/* Render your existing Analytics component */}
      <Analytics darkMode={darkMode} t={t} />
    </div>
  );
};

export default AnalyticsPage;