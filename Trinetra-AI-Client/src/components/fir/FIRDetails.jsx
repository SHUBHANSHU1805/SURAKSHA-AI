import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, MapPin, Calendar, User } from 'lucide-react';

const FIRDetails = ({ fir, onClose }) => {
  const { t } = useTranslation();

  if (!fir) return null;

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-800',
      'High': 'bg-orange-100 text-orange-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('fir.firDetails')}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fir.crimeType}</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getSeverityColor(fir.severity)}`}>
              {fir.severity}
            </span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
              <p className="text-gray-900 dark:text-white">{fir.status}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reported By</label>
              <p className="text-gray-900 dark:text-white">{fir.reportedBy?.name || fir.officerName}</p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <label className="font-semibold text-gray-700 dark:text-gray-300">Location</label>
            </div>
            <p className="text-gray-900 dark:text-white">
              {fir.location?.address}<br/>
              {fir.location?.city}, {fir.location?.state}
            </p>
          </div>

          {/* Incident Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <label className="font-semibold text-gray-700 dark:text-gray-300">Incident Date</label>
            </div>
            <p className="text-gray-900 dark:text-white">
              {new Date(fir.incidentDate).toLocaleString()}
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-semibold text-gray-700 dark:text-gray-300">Description</label>
            <p className="text-gray-900 dark:text-white">{fir.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIRDetails;