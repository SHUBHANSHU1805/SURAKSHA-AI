import React from 'react';

const FIRData = ({ firList, darkMode, t }) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>{t.firData}</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition shadow-md">
          {t.export} CSV
        </button>
      </div>
      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>ID</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.crimeType}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.location}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.severity}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.date}</th>
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
                      fir.severity === 'High' ? 'bg-red-100 text-red-700' :
                      fir.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                    }`}>{fir.severity}</span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${textTertiary}`}>{fir.date}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">{t.view}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FIRData;