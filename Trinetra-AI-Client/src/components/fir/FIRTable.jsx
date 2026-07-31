import React from 'react';

const FIRData = ({ firList, darkMode, t, onView, pagination, onPageChange }) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>{t.firData || 'FIR Records'}</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md">
          {t.export || 'Export'} CSV
        </button>
      </div>
      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>ID</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.crimeType || 'Crime Type'}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.location || 'Location'}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.severity || 'Severity'}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.date || 'Date'}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {firList.map((fir) => (
                <tr key={fir.id} className={`transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>#{fir.id}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${textPrimary}`}>{fir.type}</td>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>{fir.location}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      fir.severity === 'Critical' ? 'bg-red-200 text-red-900' :
                      fir.severity === 'High' ? 'bg-red-100 text-red-700' :
                      fir.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{fir.severity}</span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${textTertiary}`}>{fir.date}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => onView && onView(fir.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                    >
                      {t.view || 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Details and Controls */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4 gap-4">
            <div className={`text-sm ${textTertiary}`}>
              Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold">
                {Math.min(pagination.page * pagination.limit, pagination.count)}
              </span>{' '}
              of <span className="font-semibold">{pagination.count.toLocaleString()}</span> results
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  pagination.page <= 1
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              <span className={`text-sm font-semibold ${textPrimary}`}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  pagination.page >= pagination.pages
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FIRData;