import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useFIR } from '../hooks/useFIR';
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  MapPin,
  ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { t } = useTranslation();
  const { profile } = useSelector((state) => state.auth);
  const { firs, loadFIRs, statistics } = useFIR();
  const [stats, setStats] = useState({
    total: 0,
    highSeverity: 0,
    underInvestigation: 0,
    thisMonth: 0
  });

  useEffect(() => {
    loadFIRs({ limit: 100 });
  }, []);

  useEffect(() => {
    if (firs.length > 0) {
      const today = new Date();
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const newStats = {
        total: firs.length,
        highSeverity: firs.filter(f => ['High', 'Critical'].includes(f.severity)).length,
        underInvestigation: firs.filter(f => f.status === 'Under Investigation').length,
        thisMonth: firs.filter(f => new Date(f.createdAt) >= thisMonth).length
      };
      setStats(newStats);
    }
  }, [firs]);

  const recentFIRs = firs.slice(0, 5);

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <Icon className={`w-12 h-12 ${color.replace('border', 'text')}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {t('dashboard.welcome')} 👋
        </h1>
        <p className="text-blue-100">
          {t('dashboard.overview')} • {profile?.department}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={AlertTriangle}
          title={t('fir.allFIRs')}
          value={stats.total}
          color="border-blue-500 text-blue-600"
        />
        <StatCard
          icon={TrendingUp}
          title="High Severity"
          value={stats.highSeverity}
          color="border-red-500 text-red-600"
        />
        <StatCard
          icon={Users}
          title="Under Investigation"
          value={stats.underInvestigation}
          color="border-yellow-500 text-yellow-600"
        />
        <StatCard
          icon={MapPin}
          title="This Month"
          value={stats.thisMonth}
          color="border-green-500 text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/fir-management"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('dashboard.newReport')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submit a new FIR
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-blue-600" />
          </div>
        </Link>

        <Link
          to="/analytics"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('dashboard.viewAnalytics')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View crime statistics
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-green-600" />
          </div>
        </Link>

        <Link
          to="/map"
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {t('dashboard.viewMap')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View crime heatmap
              </p>
            </div>
            <ArrowRight className="w-6 h-6 text-purple-600" />
          </div>
        </Link>
      </div>

      {/* Recent FIRs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('fir.recentFIRs')}
        </h2>

        <div className="space-y-3">
          {recentFIRs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              {t('fir.noFIRs')}
            </p>
          ) : (
            recentFIRs.map((fir) => (
              <div
                key={fir.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {fir.crimeType}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {fir.location?.city}, {fir.location?.state}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    fir.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    fir.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {fir.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;