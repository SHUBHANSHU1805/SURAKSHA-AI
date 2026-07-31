import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFIR } from '../hooks/useFIR';
import FIRForm from '../components/fir/FIRForm';
import FIRTable from '../components/fir/FIRTable';
import FIRDetails from '../components/fir/FIRDetails';
import { Plus } from 'lucide-react';

const FIRManagement = () => {
  const { t } = useTranslation();
  const { 
    firs, 
    loadFIRs, 
    selectedFIR, 
    clearSelection, 
    submitSuccess, 
    resetSubmitSuccess,
    filters,
    pagination,
    applyFilters,
    resetFilters,
    loadFIRDetails
  } = useFIR();

  const [showForm, setShowForm] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Local filter states
  const [stateFilter, setStateFilter] = useState(filters.state || '');
  const [cityFilter, setCityFilter] = useState(filters.city || '');
  const [severityFilter, setSeverityFilter] = useState(filters.severity || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || '');

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

  // Synchronize local states when store filters are reset or modified
  useEffect(() => {
    setStateFilter(filters.state || '');
    setCityFilter(filters.city || '');
    setSeverityFilter(filters.severity || '');
    setStatusFilter(filters.status || '');
  }, [filters]);

  // Load FIRs dynamically whenever filters change (this covers searches and page turns)
  useEffect(() => {
    loadFIRs();
  }, [filters]);

  // Handle form submission success
  useEffect(() => {
    if (submitSuccess) {
      setShowForm(false);
      loadFIRs();
      resetSubmitSuccess();
    }
  }, [submitSuccess, loadFIRs, resetSubmitSuccess]);

  const handleApplyFilters = () => {
    applyFilters({
      state: stateFilter,
      city: cityFilter,
      severity: severityFilter,
      status: statusFilter,
      page: 1 // Reset to first page on search
    });
  };

  const handleResetFilters = () => {
    resetFilters();
  };

  const handlePageChange = (newPage) => {
    applyFilters({ page: newPage });
  };

  const handleViewDetails = (firId) => {
    loadFIRDetails(firId);
  };

  // Transform firs to match FIRTable expected format
  const transformedFirs = firs.map(fir => ({
    id: fir.id,
    type: fir.crimeType || 'Unknown',
    location: fir.location?.city ? `${fir.location.city}, ${fir.location.state || ''}` : 'Unknown',
    severity: fir.severity || 'Low',
    date: fir.createdAt ? new Date(fir.createdAt).toLocaleDateString() : new Date().toLocaleDateString()
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('nav.firManagement') || 'FIR Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and track FIR reports across all regions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-md"
        >
          <Plus className="w-5 h-5" />
          {t('fir.submitFIR') || 'Submit FIR'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300">
          <FIRForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Database Filtering Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Search Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
              type="text"
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              placeholder="e.g. Maharashtra"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">City</label>
            <input
              type="text"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            >
              <option value="">All Severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white px-3 py-2 border"
            >
              <option value="">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
          <button
            onClick={handleResetFilters}
            className="px-5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <FIRTable 
          firList={transformedFirs} 
          darkMode={darkMode} 
          t={t} 
          onView={handleViewDetails}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Details Modal */}
      {selectedFIR && (
        <FIRDetails fir={selectedFIR} onClose={clearSelection} />
      )}
    </div>
  );
};

export default FIRManagement;