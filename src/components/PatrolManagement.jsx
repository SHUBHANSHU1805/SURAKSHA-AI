import React from 'react';
import { Plus } from 'lucide-react';

const PatrolManagement = ({ 
  patrolRoutes, 
  showRouteForm, 
  setShowRouteForm, 
  routeFormData, 
  setRouteFormData, 
  handleSubmitRoute, 
  darkMode, 
  t 
}) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-3xl font-bold ${textPrimary}`}>{t.patrolManagement}</h1>
        <button 
          onClick={() => setShowRouteForm(!showRouteForm)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />{t.planNewRoute}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-blue-100 text-sm">{t.activePatrols}</p>
          <p className="text-3xl font-bold mt-2">{patrolRoutes.filter(r => r.status === 'Active').length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-purple-100 text-sm">{t.plannedRoutes}</p>
          <p className="text-3xl font-bold mt-2">{patrolRoutes.filter(r => r.status === 'Scheduled').length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm">{t.completedToday}</p>
          <p className="text-3xl font-bold mt-2">{patrolRoutes.filter(r => r.status === 'Completed').length}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white shadow-lg">
          <p className="text-orange-100 text-sm">{t.totalRoutes}</p>
          <p className="text-3xl font-bold mt-2">{patrolRoutes.length}</p>
        </div>
      </div>

      {showRouteForm && (
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>{t.planNewRoute}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.routeName}</label>
              <input 
                type="text" 
                value={routeFormData.name} 
                onChange={(e) => setRouteFormData({...routeFormData, name: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                placeholder="Enter route name" 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.assignedOfficer}</label>
              <input 
                type="text" 
                value={routeFormData.officer} 
                onChange={(e) => setRouteFormData({...routeFormData, officer: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                placeholder="Enter officer name" 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.startPoint}</label>
              <input 
                type="text" 
                value={routeFormData.start} 
                onChange={(e) => setRouteFormData({...routeFormData, start: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                placeholder="Enter start location" 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.endPoint}</label>
              <input 
                type="text" 
                value={routeFormData.end} 
                onChange={(e) => setRouteFormData({...routeFormData, end: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                placeholder="Enter end location" 
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.patrolTime}</label>
              <input 
                type="text" 
                value={routeFormData.time} 
                onChange={(e) => setRouteFormData({...routeFormData, time: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
                placeholder="e.g., 18:00 - 22:00" 
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleSubmitRoute} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition shadow-md"
              >
                {t.submit}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>{t.currentScheduled}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>ID</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.routeName}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.startPoint}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.endPoint}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.patrolTime}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.assignedOfficer}</th>
                <th className={`px-4 py-3 text-left text-sm font-semibold ${textSecondary}`}>{t.status}</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {patrolRoutes.map((route) => (
                <tr key={route.id} className={`transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>#{route.id}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${textPrimary}`}>{route.name}</td>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>{route.start}</td>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>{route.end}</td>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>{route.time}</td>
                  <td className={`px-4 py-3 text-sm ${textSecondary}`}>{route.officer}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      route.status === 'Active' ? 'bg-green-100 text-green-700' :
                      route.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>{route.status}</span>
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

export default PatrolManagement;
