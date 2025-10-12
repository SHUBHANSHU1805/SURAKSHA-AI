import React, { useState } from 'react';
import { Activity, FileText, MapPin, Navigation, TrendingUp, Menu, X, Globe, Shield, Sun, Moon } from 'lucide-react';
import { translations } from './utils/translations';
import { mockFIRData, mockPatrolRoutes } from './utils/mockData';
import Dashboard from './components/Dashboard';
import SubmitFIR from './components/SubmitFIR';
import FIRData from './components/FIRData';
import PatrolManagement from './components/PatrolManagement';
import Analytics from './components/Analytics';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [firList, setFirList] = useState(mockFIRData);
  const [patrolRoutes, setPatrolRoutes] = useState(mockPatrolRoutes);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [formData, setFormData] = useState({ type: '', location: '', severity: '', description: '' });
  const [routeFormData, setRouteFormData] = useState({ name: '', start: '', end: '', time: '', officer: '' });

  const t = translations[language];

  const handleSubmitFIR = () => {
    if (!formData.type || !formData.location || !formData.severity || !formData.description) {
      alert(language === 'en' ? 'Please fill all fields!' : 'कृपया सभी फ़ील्ड भरें!');
      return;
    }
    const newFIR = {
      id: firList.length + 1,
      type: formData.type,
      location: formData.location,
      severity: formData.severity,
      description: formData.description,
      date: new Date().toISOString().split('T')[0],
      lat: 19.0760 + Math.random() * 0.2,
      lng: 72.8777 + Math.random() * 0.2
    };
    setFirList([newFIR, ...firList]);
    setFormData({ type: '', location: '', severity: '', description: '' });
    alert(language === 'en' ? 'FIR submitted successfully!' : 'एफआईआर सफलतापूर्वक दर्ज की गई!');
  };

  const handleSubmitRoute = () => {
    if (!routeFormData.name || !routeFormData.start || !routeFormData.end || !routeFormData.time || !routeFormData.officer) {
      alert(language === 'en' ? 'Please fill all fields!' : 'कृपया सभी फ़ील्ड भरें!');
      return;
    }
    const newRoute = {
      id: patrolRoutes.length + 1,
      name: routeFormData.name,
      start: routeFormData.start,
      end: routeFormData.end,
      time: routeFormData.time,
      officer: routeFormData.officer,
      status: 'Scheduled'
    };
    setPatrolRoutes([...patrolRoutes, newRoute]);
    setRouteFormData({ name: '', start: '', end: '', time: '', officer: '' });
    setShowRouteForm(false);
    alert(language === 'en' ? 'Route planned successfully!' : 'मार्ग सफलतापूर्वक नियोजित!');
  };

  const bgMain = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`min-h-screen flex ${bgMain}`}>
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0'} overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800 text-white`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Shield className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Trinetra AI</h1>
          </div>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Activity, label: t.dashboard },
              { id: 'submitFIR', icon: FileText, label: t.submitFIR },
              { id: 'firData', icon: MapPin, label: t.firData },
              { id: 'patrolManagement', icon: Navigation, label: t.patrolManagement },
              { id: 'analytics', icon: TrendingUp, label: t.analytics }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${currentPage === item.id ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className={darkMode ? 'bg-gray-800 shadow-sm' : 'bg-white shadow-sm'}>
          <div className="flex items-center justify-between px-6 py-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} 
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition ${darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <Globe className="w-5 h-5" />
                <span>{t.language}</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">A</div>
                <div className="text-sm">
                  <p className={`font-semibold ${textPrimary}`}>Admin User</p>
                  <p className={textTertiary}>Police HQ</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {currentPage === 'dashboard' && (
            <Dashboard firList={firList} patrolRoutes={patrolRoutes} darkMode={darkMode} t={t} />
          )}
          {currentPage === 'submitFIR' && (
            <SubmitFIR 
              formData={formData} 
              setFormData={setFormData} 
              handleSubmitFIR={handleSubmitFIR} 
              darkMode={darkMode} 
              t={t} 
            />
          )}
          {currentPage === 'firData' && (
            <FIRData firList={firList} darkMode={darkMode} t={t} />
          )}
          {currentPage === 'patrolManagement' && (
            <PatrolManagement 
              patrolRoutes={patrolRoutes}
              showRouteForm={showRouteForm}
              setShowRouteForm={setShowRouteForm}
              routeFormData={routeFormData}
              setRouteFormData={setRouteFormData}
              handleSubmitRoute={handleSubmitRoute}
              darkMode={darkMode}
              t={t}
            />
          )}
          {currentPage === 'analytics' && (
            <Analytics darkMode={darkMode} t={t} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;