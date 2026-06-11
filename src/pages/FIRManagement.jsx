import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFIR } from '../hooks/useFIR';
import FIRForm from '../components/fir/FIRForm';
import FIRTable from '../components/fir/FIRTable';
import FIRDetails from '../components/fir/FIRDetails';
import { Plus } from 'lucide-react';

const FIRManagement = () => {
  const { t } = useTranslation();
  const { firs, loadFIRs, selectedFIR, clearSelection, submitSuccess, resetSubmitSuccess } = useFIR();
  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    });
    
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Load FIRs on mount - use empty dependency array to run only once
  useEffect(() => {
    loadFIRs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle form submission success
  useEffect(() => {
    if (submitSuccess) {
      setShowForm(false);
      loadFIRs();
      resetSubmitSuccess();
    }
  }, [submitSuccess, loadFIRs, resetSubmitSuccess]);

  // Transform firs to match FIRTable expected format
  const transformedFirs = firs.map(fir => ({
    id: fir.id,
    type: fir.crimeType || 'Unknown',
    location: fir.location?.city || 'Unknown',
    severity: fir.severity || 'Low',
    date: fir.createdAt || new Date().toLocaleDateString()
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.firManagement')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track FIR reports
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('fir.submitFIR')}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <FIRForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <FIRTable firList={transformedFirs} darkMode={darkMode} t={t} />
      </div>

      {/* Details Modal */}
      {selectedFIR && (
        <FIRDetails fir={selectedFIR} onClose={clearSelection} />
      )}
    </div>
  );
};

export default FIRManagement;