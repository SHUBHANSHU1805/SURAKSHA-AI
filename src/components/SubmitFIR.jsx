import React from 'react';

const SubmitFIR = ({ formData, setFormData, handleSubmitFIR, darkMode, t }) => {
  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-lg shadow-md p-8 ${bgCard}`}>
        <h1 className={`text-3xl font-bold mb-6 ${textPrimary}`}>{t.submitFIR}</h1>
        <div className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.crimeType}</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
            >
              <option value="">Select crime type</option>
              <option value="Robbery">Robbery</option>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Burglary">Burglary</option>
              <option value="Vandalism">Vandalism</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.location}</label>
            <input 
              type="text" 
              value={formData.location} 
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
              placeholder="Enter location" 
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.severity}</label>
            <select 
              value={formData.severity} 
              onChange={(e) => setFormData({...formData, severity: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.description}</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300'}`}
              rows="4" 
              placeholder="Enter detailed description" 
            />
          </div>
          <button 
            onClick={handleSubmitFIR} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md"
          >
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmitFIR;