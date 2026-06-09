import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { User, Bell, Lock, Globe } from 'lucide-react';

const Settings = () => {
  const { t } = useTranslation();
  const { profile } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'language', label: 'Language', icon: Globe }
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your account and preferences
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-green-700 dark:text-green-400">
          {t('settings.settingsSaved')}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('settings.profile')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.name')}
                    </label>
                    <input
                      type="text"
                      value={profile?.name}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.email')}
                    </label>
                    <input
                      type="email"
                      value={profile?.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.department')}
                    </label>
                    <input
                      type="text"
                      value={profile?.department}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('auth.badgeNumber')}
                    </label>
                    <input
                      type="text"
                      value={profile?.badgeNumber}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {t('common.save')}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('settings.notifications')}
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Email notifications for new FIRs
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      High severity crime alerts
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Weekly crime summary
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {t('common.save')}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('settings.security')}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.currentPassword')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {t('settings.newPassword')}
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    {t('settings.changePassword')}
                  </button>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('settings.language')}
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-blue-300 rounded-lg bg-blue-50 dark:bg-blue-900/20 cursor-pointer">
                    <input type="radio" name="language" defaultChecked className="w-5 h-5" />
                    <span className="text-gray-900 dark:text-white font-medium">English</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <input type="radio" name="language" className="w-5 h-5" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">हिन्दी (Hindi)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;