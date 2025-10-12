import React from 'react';
import { MapPin, FileText, AlertTriangle, Navigation, TrendingUp } from 'lucide-react';
import MapPlaceholder from './MapPlaceholder';

const Dashboard = ({ firList, patrolRoutes, darkMode, t }) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${textPrimary}`}>{t.welcome}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">{t.totalFIRs}</p>
              <p className="text-3xl font-bold mt-2">{firList.length}</p>
            </div>
            <FileText className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">{t.highRisk}</p>
              <p className="text-3xl font-bold mt-2">3</p>
            </div>
            <AlertTriangle className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">{t.activePatrols}</p>
              <p className="text-3xl font-bold mt-2">{patrolRoutes.filter(r => r.status === 'Active').length}</p>
            </div>
            <Navigation className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
          <MapPin className="w-5 h-5 text-blue-600" />{t.heatmap}
        </h2>
        <MapPlaceholder firData={firList} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <TrendingUp className="w-5 h-5 text-purple-600" />{t.crimeTrends}
          </h2>
          <div className="space-y-3">
            {['Robbery', 'Theft', 'Assault', 'Burglary'].map((type, i) => (
              <div key={type} className="flex items-center gap-3">
                <div className={`flex-1 rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: `${70 - i * 15}%` }}></div>
                </div>
                <span className={`text-sm w-20 ${textSecondary}`}>{type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>{t.recentFIRs}</h2>
          <div className="space-y-2">
            {firList.slice(0, 4).map((fir) => (
              <div key={fir.id} className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div>
                  <p className={`font-semibold text-sm ${textPrimary}`}>{fir.type}</p>
                  <p className={`text-xs ${textTertiary}`}>{fir.location}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  fir.severity === 'High' ? 'bg-red-100 text-red-700' :
                  fir.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>{fir.severity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;