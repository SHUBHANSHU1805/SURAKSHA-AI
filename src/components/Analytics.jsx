import React, { useState, useEffect } from 'react';
import { Shield, Navigation } from 'lucide-react';

const Analytics = ({ darkMode, t }) => {
  const [animateHistogram, setAnimateHistogram] = useState(false);
  const [animatePieChart, setAnimatePieChart] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPieSegment, setHoveredPieSegment] = useState(null);

  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setAnimateHistogram(true), 100);
    setTimeout(() => setAnimatePieChart(true), 300);
  }, []);

  const histogramData = [
    { type: 'Robbery', count: 45, color: '#ef4444' },
    { type: 'Theft', count: 78, color: '#f97316' },
    { type: 'Assault', count: 32, color: '#eab308' },
    { type: 'Burglary', count: 56, color: '#3b82f6' },
    { type: 'Vandalism', count: 23, color: '#8b5cf6' }
  ];

  const pieData = [
    { label: 'Critical', count: 48, color: '#ef4444', dasharray: '150.8 502.65', offset: 0 },
    { label: 'High', count: 32, color: '#f97316', dasharray: '100.53 502.65', offset: -150.8 },
    { label: 'Medium', count: 40, color: '#eab308', dasharray: '125.66 502.65', offset: -251.33 },
    { label: 'Low', count: 40, color: '#22c55e', dasharray: '125.66 502.65', offset: -376.99 }
  ];

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${textPrimary}`}>{t.analytics}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Type Distribution Histogram */}
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>Crime Type Distribution (Histogram)</h2>
          <div className="space-y-4">
            {histogramData.map((item, index) => (
              <div 
                key={item.type}
                className="relative"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                <div className="flex justify-between mb-2">
                  <span className={`text-sm font-medium ${textPrimary} transition-all duration-300 ${hoveredBar === index ? 'scale-110 font-bold' : ''}`}>
                    {item.type}
                  </span>
                  <span className={`text-sm ${textTertiary} transition-all duration-300 ${hoveredBar === index ? 'scale-110 font-semibold' : ''}`}>
                    {item.count} cases
                  </span>
                </div>
                <div className={`w-full rounded-full h-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden relative`}>
                  <div
                    className={`h-6 rounded-full flex items-center justify-end pr-2 text-white text-xs font-semibold transition-all duration-700 ease-out ${
                      hoveredBar === index ? 'shadow-lg scale-y-110' : ''
                    }`}
                    style={{ 
                      width: animateHistogram ? `${(item.count / 78) * 100}%` : '0%',
                      backgroundColor: item.color,
                      transitionDelay: `${index * 100}ms`,
                      transform: hoveredBar === index ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  >
                    <span className={`transition-all duration-300 ${hoveredBar === index ? 'scale-125' : ''}`}>
                      {Math.round((item.count / 234) * 100)}%
                    </span>
                  </div>
                  
                  {/* Tooltip on hover */}
                  {hoveredBar === index && (
                    <div 
                      className="absolute top-[-40px] right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg animate-bounce"
                      style={{ animation: 'bounce 0.5s ease-in-out' }}
                    >
                      {item.count} cases
                      <div className="absolute bottom-[-4px] right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>Priority Distribution (Pie Chart)</h2>
          <div className="flex items-center justify-center h-64 relative">
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
              <circle cx="100" cy="100" r="80" fill="none" stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="60" />
              
              {pieData.map((item, index) => (
                <g key={item.label}>
                  <circle 
                    cx="100" 
                    cy="100" 
                    r="80" 
                    fill="none" 
                    stroke={item.color} 
                    strokeWidth={hoveredPieSegment === index ? "70" : "60"}
                    strokeDasharray={item.dasharray}
                    strokeDashoffset={animatePieChart ? item.offset : 502.65}
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-700 ease-out cursor-pointer"
                    style={{ 
                      transitionDelay: `${index * 150}ms`,
                      filter: hoveredPieSegment === index ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'none'
                    }}
                    onMouseEnter={() => setHoveredPieSegment(index)}
                    onMouseLeave={() => setHoveredPieSegment(null)}
                  />
                  
                  {/* Animated popup label on hover */}
                  {hoveredPieSegment === index && (
                    <g className="animate-popup">
                      <rect
                        x="85"
                        y="85"
                        width="30"
                        height="30"
                        fill={darkMode ? '#1f2937' : 'white'}
                        stroke={item.color}
                        strokeWidth="2"
                        rx="4"
                        className="shadow-lg"
                        style={{
                          animation: 'popup 0.3s ease-out'
                        }}
                      />
                      <text
                        x="100"
                        y="100"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={item.color}
                        fontSize="14"
                        fontWeight="bold"
                      >
                        {item.count}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>
            
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className={`text-2xl font-bold ${textPrimary}`}>160</p>
                <p className={`text-xs ${textTertiary}`}>Total Cases</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {pieData.map((item, index) => (
              <div 
                key={item.label} 
                className={`flex items-center gap-2 cursor-pointer transition-all duration-300 p-2 rounded ${
                  hoveredPieSegment === index ? 'bg-opacity-10 scale-105' : ''
                }`}
                style={{ backgroundColor: hoveredPieSegment === index ? item.color + '20' : 'transparent' }}
                onMouseEnter={() => setHoveredPieSegment(index)}
                onMouseLeave={() => setHoveredPieSegment(null)}
              >
                <div 
                  className={`w-4 h-4 rounded transition-all duration-300 ${
                    hoveredPieSegment === index ? 'w-5 h-5 shadow-md' : ''
                  }`} 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className={`text-sm ${textSecondary} transition-all duration-300 ${
                  hoveredPieSegment === index ? 'font-bold' : ''
                }`}>
                  {item.label}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Crime Trends Line Graph */}
      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>Monthly Crime Trends (Line Graph)</h2>
        <div className="relative h-64">
          <svg viewBox="0 0 800 250" className="w-full h-full">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <line x1="50" y1="200" x2="750" y2="200" stroke={darkMode ? '#4b5563' : '#d1d5db'} strokeWidth="2" />
            <line x1="50" y1="20" x2="50" y2="200" stroke={darkMode ? '#4b5563' : '#d1d5db'} strokeWidth="2" />
            {[0, 50, 100, 150, 200].map((y, i) => (
              <g key={i}>
                <line x1="45" y1={200 - y * 0.9} x2="750" y2={200 - y * 0.9} stroke={darkMode ? '#374151' : '#e5e7eb'} strokeWidth="1" strokeDasharray="5,5" />
                <text x="35" y={205 - y * 0.9} fill={darkMode ? '#9ca3af' : '#6b7280'} fontSize="12" textAnchor="end">{y}</text>
              </g>
            ))}
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'].map((month, i) => (
              <text key={month} x={80 + i * 70} y="220" fill={darkMode ? '#9ca3af' : '#6b7280'} fontSize="12" textAnchor="middle">{month}</text>
            ))}
            <polyline
              fill="url(#lineGradient)"
              stroke="none"
              points="80,200 150,140 220,120 290,160 360,100 430,90 500,110 570,80 640,120 710,70 710,200 80,200"
            />
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              points="80,140 150,120 220,90 290,130 360,70 430,60 500,80 570,50 640,90 710,40"
            />
            {[
              [80, 140], [150, 120], [220, 90], [290, 130], [360, 70],
              [430, 60], [500, 80], [570, 50], [640, 90], [710, 40]
            ].map((point, i) => (
              <circle key={i} cx={point[0]} cy={point[1]} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
            ))}
          </svg>
        </div>
      </div>

      {/* Women's Safety and Patrol Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Shield className="w-5 h-5 text-green-600" />{t.womenSafety}
          </h2>
          <div className="space-y-3">
            {[
              { zone: 'Zone A - Andheri', safety: 85, color: 'green' },
              { zone: 'Zone B - Bandra', safety: 70, color: 'yellow' },
              { zone: 'Zone C - Colaba', safety: 45, color: 'red' },
              { zone: 'Zone D - Dadar', safety: 78, color: 'green' }
            ].map((item) => (
              <div key={item.zone} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${textPrimary}`}>{item.zone}</span>
                  <span className={textTertiary}>{item.safety}%</span>
                </div>
                <div className={`flex-1 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full transition-all ${
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: item.safety + '%' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Navigation className="w-5 h-5 text-blue-600" />Patrol Recommendations
          </h2>
          <div className="space-y-3">
            {[
              { route: 'Route 1: Andheri - Bandra', priority: 'High', time: '18:00 - 22:00' },
              { route: 'Route 2: Colaba - CST', priority: 'High', time: '20:00 - 02:00' },
              { route: 'Route 3: Powai - Vikhroli', priority: 'Medium', time: '22:00 - 04:00' }
            ].map((route, i) => (
              <div key={i} className={`border rounded-lg p-4 transition ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:shadow-md'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${textPrimary}`}>{route.route}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    route.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{route.priority}</span>
                </div>
                <p className={`text-sm ${textTertiary}`}>Recommended time: {route.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes popup {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-popup {
          animation: popup 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Analytics;