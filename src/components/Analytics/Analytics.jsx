import React, { useState, useEffect } from 'react';
import { Shield, Navigation } from 'lucide-react';

const Analytics = ({ darkMode, t }) => {
  const [animateHistogram, setAnimateHistogram] = useState(false);
  const [animatePieChart, setAnimatePieChart] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredPieSegment, setHoveredPieSegment] = useState(null);
  const [selectedState, setSelectedState] = useState(null);

  const textPrimary = darkMode ? 'text-gray-100' : 'text-gray-800';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-700';
  const textTertiary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const bgCard = darkMode ? 'bg-gray-800' : 'bg-white';

  // Trigger animations on mount
  useEffect(() => {
    setTimeout(() => setAnimateHistogram(true), 100);
    setTimeout(() => setAnimatePieChart(true), 300);
  }, []);
  
  const getWomenSafetyZones = (state) => {
    const safetyData = {
      // States
      'Andhra Pradesh': [
        { zone: 'Visakhapatnam Central', safety: 78, color: 'green' },
        { zone: 'Vijayawada Market Area', safety: 65, color: 'yellow' },
        { zone: 'Guntur Railway Station', safety: 52, color: 'red' }
      ],
      'Arunachal Pradesh': [
        { zone: 'Itanagar Main Market', safety: 88, color: 'green' },
        { zone: 'Naharlagun Sector', safety: 85, color: 'green' },
        { zone: 'Pasighat Town Center', safety: 90, color: 'green' }
      ],
      'Assam': [
        { zone: 'Guwahati Fancy Bazaar', safety: 68, color: 'yellow' },
        { zone: 'Silchar Central', safety: 74, color: 'green' },
        { zone: 'Dibrugarh Railway Area', safety: 70, color: 'yellow' }
      ],
      'Bihar': [
        { zone: 'Patna Gandhi Maidan', safety: 58, color: 'red' },
        { zone: 'Gaya Station Road', safety: 62, color: 'yellow' },
        { zone: 'Bhagalpur Market', safety: 65, color: 'yellow' }
      ],
      'Chhattisgarh': [
        { zone: 'Raipur Marine Drive', safety: 75, color: 'green' },
        { zone: 'Bhilai Steel City', safety: 78, color: 'green' },
        { zone: 'Bilaspur Railway Station', safety: 72, color: 'yellow' }
      ],
      'Goa': [
        { zone: 'Panaji Market', safety: 85, color: 'green' },
        { zone: 'Margao Commercial Area', safety: 82, color: 'green' },
        { zone: 'Vasco Beach Road', safety: 80, color: 'green' }
      ],
      'Gujarat': [
        { zone: 'Ahmedabad Ashram Road', safety: 72, color: 'yellow' },
        { zone: 'Surat Diamond Market', safety: 78, color: 'green' },
        { zone: 'Vadodara Sayajigunj', safety: 80, color: 'green' }
      ],
      'Haryana': [
        { zone: 'Gurugram Cyber City', safety: 70, color: 'yellow' },
        { zone: 'Faridabad Sector 16', safety: 68, color: 'yellow' },
        { zone: 'Panipat GT Road', safety: 72, color: 'yellow' }
      ],
      'Himachal Pradesh': [
        { zone: 'Shimla Mall Road', safety: 88, color: 'green' },
        { zone: 'Dharamshala McLeodganj', safety: 85, color: 'green' },
        { zone: 'Manali Old Town', safety: 90, color: 'green' }
      ],
      'Jharkhand': [
        { zone: 'Ranchi Main Road', safety: 68, color: 'yellow' },
        { zone: 'Jamshedpur Bistupur', safety: 70, color: 'yellow' },
        { zone: 'Dhanbad Station Area', safety: 65, color: 'yellow' }
      ],
      'Karnataka': [
        { zone: 'Koramangala', safety: 82, color: 'green' },
        { zone: 'MG Road', safety: 68, color: 'yellow' },
        { zone: 'Whitefield', safety: 71, color: 'yellow' }
      ],
      'Kerala': [
        { zone: 'Trivandrum MG Road', safety: 82, color: 'green' },
        { zone: 'Kochi Marine Drive', safety: 85, color: 'green' },
        { zone: 'Kozhikode Beach Road', safety: 88, color: 'green' }
      ],
      'Madhya Pradesh': [
        { zone: 'Indore Palasia Square', safety: 68, color: 'yellow' },
        { zone: 'Bhopal New Market', safety: 65, color: 'yellow' },
        { zone: 'Jabalpur Napier Town', safety: 72, color: 'yellow' }
      ],
      'Maharashtra': [
        { zone: 'Andheri East', safety: 85, color: 'green' },
        { zone: 'Bandra West', safety: 70, color: 'yellow' },
        { zone: 'Colaba Causeway', safety: 45, color: 'red' },
        { zone: 'Dadar Station', safety: 78, color: 'green' }
      ],
      'Manipur': [
        { zone: 'Imphal Khwairamband', safety: 82, color: 'green' },
        { zone: 'Thoubal Market', safety: 85, color: 'green' },
        { zone: 'Bishnupur Town', safety: 88, color: 'green' }
      ],
      'Meghalaya': [
        { zone: 'Shillong Police Bazaar', safety: 85, color: 'green' },
        { zone: 'Tura Main Market', safety: 87, color: 'green' },
        { zone: 'Jowai Town Center', safety: 90, color: 'green' }
      ],
      'Mizoram': [
        { zone: 'Aizawl Bara Bazaar', safety: 92, color: 'green' },
        { zone: 'Lunglei Market', safety: 90, color: 'green' },
        { zone: 'Champhai Town', safety: 93, color: 'green' }
      ],
      'Nagaland': [
        { zone: 'Kohima Main Market', safety: 88, color: 'green' },
        { zone: 'Dimapur Commercial Area', safety: 85, color: 'green' },
        { zone: 'Mokokchung Town', safety: 90, color: 'green' }
      ],
      'Odisha': [
        { zone: 'Bhubaneswar Kharavel Nagar', safety: 72, color: 'yellow' },
        { zone: 'Cuttack Buxi Bazaar', safety: 68, color: 'yellow' },
        { zone: 'Rourkela Sector 19', safety: 75, color: 'green' }
      ],
      'Punjab': [
        { zone: 'Ludhiana Ghumar Mandi', safety: 74, color: 'green' },
        { zone: 'Amritsar Hall Bazaar', safety: 72, color: 'yellow' },
        { zone: 'Jalandhar Model Town', safety: 80, color: 'green' }
      ],
      'Rajasthan': [
        { zone: 'Jaipur MI Road', safety: 70, color: 'yellow' },
        { zone: 'Jodhpur Clock Tower', safety: 75, color: 'green' },
        { zone: 'Udaipur Lake Palace Road', safety: 85, color: 'green' }
      ],
      'Sikkim': [
        { zone: 'Gangtok MG Marg', safety: 92, color: 'green' },
        { zone: 'Namchi Town Center', safety: 90, color: 'green' },
        { zone: 'Gyalshing Market', safety: 94, color: 'green' }
      ],
      'Tamil Nadu': [
        { zone: 'T Nagar', safety: 76, color: 'green' },
        { zone: 'Anna Nagar', safety: 80, color: 'green' },
        { zone: 'Egmore', safety: 58, color: 'red' }
      ],
      'Telangana': [
        { zone: 'Hyderabad Banjara Hills', safety: 75, color: 'green' },
        { zone: 'Warangal Hanamkonda', safety: 78, color: 'green' },
        { zone: 'Nizamabad Station Road', safety: 72, color: 'yellow' }
      ],
      'Tripura': [
        { zone: 'Agartala City Center', safety: 85, color: 'green' },
        { zone: 'Udaipur Market Area', safety: 88, color: 'green' },
        { zone: 'Dharmanagar Town', safety: 87, color: 'green' }
      ],
      'Uttar Pradesh': [
        { zone: 'Gomti Nagar', safety: 70, color: 'yellow' },
        { zone: 'Hazratganj', safety: 55, color: 'red' },
        { zone: 'Alambagh', safety: 50, color: 'red' }
      ],
      'Uttarakhand': [
        { zone: 'Dehradun Rajpur Road', safety: 82, color: 'green' },
        { zone: 'Haridwar Har Ki Pauri', safety: 78, color: 'green' },
        { zone: 'Nainital Mall Road', safety: 88, color: 'green' }
      ],
      'West Bengal': [
        { zone: 'Park Street', safety: 65, color: 'yellow' },
        { zone: 'Salt Lake', safety: 72, color: 'yellow' },
        { zone: 'Howrah Station', safety: 48, color: 'red' }
      ],
      // Union Territories
      'Andaman & Nicobar': [
        { zone: 'Port Blair Aberdeen Bazaar', safety: 92, color: 'green' },
        { zone: 'Diglipur Market', safety: 94, color: 'green' },
        { zone: 'Car Nicobar Township', safety: 96, color: 'green' }
      ],
      'Chandigarh': [
        { zone: 'Sector 17 Plaza', safety: 82, color: 'green' },
        { zone: 'Panchkula Sector 5', safety: 80, color: 'green' },
        { zone: 'Mohali Phase 3B2', safety: 85, color: 'green' }
      ],
      'Dadra & Nagar Haveli and Daman & Diu': [
        { zone: 'Daman Fort Area', safety: 88, color: 'green' },
        { zone: 'Silvassa Market', safety: 90, color: 'green' },
        { zone: 'Diu Beach Road', safety: 92, color: 'green' }
      ],
      'Delhi': [
        { zone: 'Connaught Place', safety: 62, color: 'yellow' },
        { zone: 'Dwarka Sector 21', safety: 75, color: 'green' },
        { zone: 'Rohini Sector 7', safety: 55, color: 'red' }
      ],
      'Jammu & Kashmir': [
        { zone: 'Srinagar Lal Chowk', safety: 68, color: 'yellow' },
        { zone: 'Jammu Raghunath Bazaar', safety: 75, color: 'green' },
        { zone: 'Anantnag City Center', safety: 78, color: 'green' }
      ],
      'Ladakh': [
        { zone: 'Leh Main Bazaar', safety: 92, color: 'green' },
        { zone: 'Kargil Market', safety: 90, color: 'green' },
        { zone: 'Nubra Valley Roads', safety: 94, color: 'green' }
      ],
      'Lakshadweep': [
        { zone: 'Kavaratti Town', safety: 96, color: 'green' },
        { zone: 'Agatti Island Center', safety: 97, color: 'green' },
        { zone: 'Minicoy Village', safety: 98, color: 'green' }
      ],
      'Puducherry': [
        { zone: 'White Town Beach Road', safety: 85, color: 'green' },
        { zone: 'Karaikal Market', safety: 82, color: 'green' },
        { zone: 'Mahe Town Center', safety: 88, color: 'green' }
      ],
      'The Government of NCT of Delhi': [
        { zone: 'Central Delhi CP', safety: 62, color: 'yellow' },
        { zone: 'South Delhi Greater Kailash', safety: 75, color: 'green' },
        { zone: 'North Delhi Civil Lines', safety: 68, color: 'yellow' }
      ]
    };
    return safetyData[state] || [
      { zone: `${state} Central Zone`, safety: 70, color: 'yellow' },
      { zone: `${state} Market Area`, safety: 65, color: 'yellow' },
      { zone: `${state} Station Area`, safety: 55, color: 'red' }
    ];
  };

  const getPatrolRecommendations = (state) => {
    const patrolData = {
      // States
      'Andhra Pradesh': [
        { route: 'Visakhapatnam Beach Road', priority: 'High', time: '20:00 - 02:00' },
        { route: 'Vijayawada MG Road', priority: 'Medium', time: '18:00 - 22:00' },
        { route: 'Guntur Market Connectivity', priority: 'Medium', time: '19:00 - 23:00' }
      ],
      'Arunachal Pradesh': [
        { route: 'Itanagar Zero Point Route', priority: 'Low', time: '19:00 - 23:00' },
        { route: 'Naharlagun Main Road', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Assam': [
        { route: 'Guwahati Fancy Bazaar - Paltan Bazaar', priority: 'High', time: '18:00 - 01:00' },
        { route: 'Silchar Station Road', priority: 'Medium', time: '19:00 - 23:00' },
        { route: 'Dibrugarh Market Areas', priority: 'Medium', time: '18:00 - 22:00' }
      ],
      'Bihar': [
        { route: 'Patna Gandhi Maidan - Boring Road', priority: 'High', time: '17:00 - 02:00' },
        { route: 'Gaya Station - Bodh Gaya Road', priority: 'High', time: '18:00 - 01:00' },
        { route: 'Bhagalpur University Area', priority: 'Medium', time: '19:00 - 23:00' }
      ],
      'Chhattisgarh': [
        { route: 'Raipur Marine Drive Corridor', priority: 'Medium', time: '18:00 - 23:00' },
        { route: 'Bhilai Steel City Routes', priority: 'Low', time: '19:00 - 22:00' },
        { route: 'Bilaspur Station Connectivity', priority: 'Medium', time: '18:00 - 01:00' }
      ],
      'Goa': [
        { route: 'Panaji - Miramar Beach Road', priority: 'Medium', time: '20:00 - 02:00' },
        { route: 'Margao Market - Colva Road', priority: 'Low', time: '19:00 - 23:00' },
        { route: 'Vasco Port Area', priority: 'Medium', time: '18:00 - 22:00' }
      ],
      'Gujarat': [
        { route: 'Ahmedabad SG Highway', priority: 'High', time: '19:00 - 01:00' },
        { route: 'Surat Ring Road', priority: 'Medium', time: '20:00 - 23:00' },
        { route: 'Vadodara Sayajigunj Area', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Haryana': [
        { route: 'Gurugram Cyber City - Golf Course Road', priority: 'High', time: '18:00 - 02:00' },
        { route: 'Faridabad Sector Routes', priority: 'Medium', time: '19:00 - 01:00' },
        { route: 'Panipat GT Road', priority: 'Medium', time: '18:00 - 22:00' }
      ],
      'Himachal Pradesh': [
        { route: 'Shimla Mall Road - Ridge', priority: 'Low', time: '19:00 - 22:00' },
        { route: 'Dharamshala - McLeodganj Road', priority: 'Low', time: '18:00 - 21:00' },
        { route: 'Manali Old Town Routes', priority: 'Low', time: '19:00 - 23:00' }
      ],
      'Jharkhand': [
        { route: 'Ranchi Main Road - Albert Ekka Chowk', priority: 'Medium', time: '18:00 - 01:00' },
        { route: 'Jamshedpur Bistupur - Sakchi', priority: 'Medium', time: '19:00 - 23:00' },
        { route: 'Dhanbad Station Area', priority: 'High', time: '18:00 - 02:00' }
      ],
      'Karnataka': [
        { route: 'MG Road - Brigade Road', priority: 'High', time: '19:00 - 01:00' },
        { route: 'Koramangala Main Roads', priority: 'Medium', time: '20:00 - 02:00' },
        { route: 'Whitefield IT Corridor', priority: 'Medium', time: '21:00 - 01:00' }
      ],
      'Kerala': [
        { route: 'Trivandrum MG Road - Statue', priority: 'Medium', time: '18:00 - 23:00' },
        { route: 'Kochi Marine Drive', priority: 'Low', time: '19:00 - 22:00' },
        { zone: 'Kozhikode Beach - City Center', priority: 'Low', time: '18:00 - 21:00' }
      ],
      'Madhya Pradesh': [
        { route: 'Indore Palasia - Vijay Nagar', priority: 'High', time: '18:00 - 01:00' },
        { route: 'Bhopal New Market - MP Nagar', priority: 'High', time: '19:00 - 02:00' },
        { route: 'Jabalpur Napier Town Routes', priority: 'Medium', time: '18:00 - 22:00' }
      ],
      'Maharashtra': [
        { route: 'Andheri - Bandra Link Road', priority: 'High', time: '18:00 - 22:00' },
        { route: 'Colaba - CST Corridor', priority: 'High', time: '20:00 - 02:00' },
        { route: 'Powai - Vikhroli Route', priority: 'Medium', time: '22:00 - 04:00' }
      ],
      'Manipur': [
        { route: 'Imphal Khwairamband Market', priority: 'Low', time: '18:00 - 21:00' },
        { route: 'Thoubal Market Roads', priority: 'Low', time: '17:00 - 20:00' }
      ],
      'Meghalaya': [
        { route: 'Shillong Police Bazaar - Laitumkhrah', priority: 'Low', time: '18:00 - 22:00' },
        { route: 'Tura Market Area', priority: 'Low', time: '17:00 - 20:00' }
      ],
      'Mizoram': [
        { route: 'Aizawl Bara Bazaar - Zarkawt', priority: 'Low', time: '17:00 - 21:00' },
        { route: 'Lunglei Town Routes', priority: 'Low', time: '18:00 - 20:00' }
      ],
      'Nagaland': [
        { route: 'Kohima Market - Police Point', priority: 'Low', time: '17:00 - 21:00' },
        { route: 'Dimapur Commercial Areas', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Odisha': [
        { route: 'Bhubaneswar Station - Kharavel Nagar', priority: 'Medium', time: '18:00 - 01:00' },
        { route: 'Cuttack Buxi Bazaar Routes', priority: 'High', time: '19:00 - 02:00' },
        { route: 'Rourkela Sector Routes', priority: 'Medium', time: '18:00 - 22:00' }
      ],
      'Punjab': [
        { route: 'Ludhiana Ghumar Mandi - PAU Road', priority: 'Medium', time: '18:00 - 23:00' },
        { route: 'Amritsar Hall Bazaar - Golden Temple', priority: 'Medium', time: '19:00 - 01:00' },
        { route: 'Jalandhar Model Town Routes', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Rajasthan': [
        { route: 'Jaipur MI Road - Station Road', priority: 'High', time: '18:00 - 01:00' },
        { route: 'Jodhpur Clock Tower Area', priority: 'Medium', time: '19:00 - 23:00' },
        { route: 'Udaipur Lake Palace - City Palace', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Sikkim': [
        { route: 'Gangtok MG Marg - Mall Road', priority: 'Low', time: '17:00 - 21:00' },
        { route: 'Namchi Town Routes', priority: 'Low', time: '18:00 - 20:00' }
      ],
      'Tamil Nadu': [
        { route: 'T Nagar - Anna Nagar', priority: 'Medium', time: '18:00 - 22:00' },
        { route: 'Egmore - Central Station', priority: 'High', time: '20:00 - 03:00' },
        { route: 'Coimbatore RS Puram Routes', priority: 'Medium', time: '19:00 - 23:00' }
      ],
      'Telangana': [
        { route: 'Hyderabad Banjara Hills - Jubilee Hills', priority: 'Medium', time: '19:00 - 01:00' },
        { route: 'Warangal Hanamkonda Routes', priority: 'Low', time: '18:00 - 22:00' },
        { route: 'Nizamabad Station Connectivity', priority: 'Medium', time: '18:00 - 23:00' }
      ],
      'Tripura': [
        { route: 'Agartala City Center - Palace Compound', priority: 'Low', time: '18:00 - 21:00' },
        { route: 'Udaipur Market Routes', priority: 'Low', time: '17:00 - 20:00' }
      ],
      'Uttar Pradesh': [
        { route: 'Hazratganj Market Route', priority: 'High', time: '18:00 - 23:00' },
        { route: 'Gomti Nagar Extension', priority: 'Medium', time: '20:00 - 01:00' },
        { route: 'Kanpur Mall Road - Civil Lines', priority: 'High', time: '19:00 - 02:00' }
      ],
      'Uttarakhand': [
        { route: 'Dehradun Rajpur Road - Clock Tower', priority: 'Medium', time: '18:00 - 22:00' },
        { route: 'Haridwar Har Ki Pauri Routes', priority: 'Low', time: '17:00 - 21:00' },
        { route: 'Nainital Mall Road', priority: 'Low', time: '19:00 - 22:00' }
      ],
      'West Bengal': [
        { route: 'Park Street - Esplanade', priority: 'High', time: '19:00 - 02:00' },
        { route: 'Salt Lake Sectors', priority: 'Medium', time: '21:00 - 01:00' },
        { route: 'Howrah Station - Maidan', priority: 'High', time: '18:00 - 03:00' }
      ],
      // Union Territories
      'Andaman & Nicobar': [
        { route: 'Port Blair Aberdeen - Marina Park', priority: 'Low', time: '18:00 - 21:00' },
        { route: 'Diglipur Market Routes', priority: 'Low', time: '17:00 - 20:00' }
      ],
      'Chandigarh': [
        { route: 'Sector 17 - Sector 22 Corridor', priority: 'Medium', time: '18:00 - 23:00' },
        { route: 'Panchkula Market Routes', priority: 'Low', time: '19:00 - 22:00' },
        { route: 'Mohali Phase Routes', priority: 'Low', time: '18:00 - 22:00' }
      ],
      'Dadra & Nagar Haveli and Daman & Diu': [
        { route: 'Daman Fort - Beach Road', priority: 'Low', time: '19:00 - 22:00' },
        { route: 'Silvassa Market Connectivity', priority: 'Low', time: '18:00 - 21:00' }
      ],
      'Delhi': [
        { route: 'CP - India Gate Route', priority: 'High', time: '19:00 - 01:00' },
        { route: 'Dwarka Sector Routes', priority: 'Medium', time: '21:00 - 03:00' },
        { route: 'Rohini Market Areas', priority: 'High', time: '18:00 - 23:00' }
      ],
      'Jammu & Kashmir': [
        { route: 'Srinagar Lal Chowk - Dal Gate', priority: 'High', time: '17:00 - 22:00' },
        { route: 'Jammu Raghunath Bazaar', priority: 'Medium', time: '18:00 - 23:00' },
        { route: 'Anantnag Market Routes', priority: 'Medium', time: '18:00 - 21:00' }
      ],
      'Ladakh': [
        { route: 'Leh Main Bazaar Routes', priority: 'Low', time: '17:00 - 20:00' },
        { route: 'Kargil Market Area', priority: 'Low', time: '18:00 - 21:00' }
      ],
      'Lakshadweep': [
        { route: 'Kavaratti Island Routes', priority: 'Low', time: '18:00 - 20:00' },
        { route: 'Agatti Island Connectivity', priority: 'Low', time: '17:00 - 19:00' }
      ],
      'Puducherry': [
        { route: 'White Town - Beach Road', priority: 'Medium', time: '19:00 - 23:00' },
        { route: 'Karaikal Market Routes', priority: 'Low', time: '18:00 - 21:00' }
      ],
      'The Government of NCT of Delhi': [
        { route: 'Central Delhi CP - Chandni Chowk', priority: 'High', time: '19:00 - 02:00' },
        { route: 'South Delhi Saket - GK Routes', priority: 'Medium', time: '20:00 - 01:00' },
        { route: 'North Delhi Civil Lines - Kamla Nagar', priority: 'Medium', time: '18:00 - 23:00' }
      ]
    };
    return patrolData[state] || [
      { route: `${state} Main Market Route`, priority: 'High', time: '18:00 - 23:00' },
      { route: `${state} Station Connectivity`, priority: 'Medium', time: '20:00 - 01:00' }
    ];
  };


  const histogramData = [
    { type: 'Robbery', count:3545, color: '#ef4444' },
    { type: 'Theft', count: 2090, color: '#f97316' },
    { type: 'Assault', count: 1770, color: '#eab308' },
    { type: 'Burglary', count: 1460, color: '#3b82f6' },
    { type: 'Vandalism', count: 1440, color: '#8b5cf6' }
  ];

  const pieData = [
    { label: 'Critical', count: 2750, color: '#ef4444', dasharray: '150.8 502.65', offset: 0 },
    { label: 'High', count: 2743, color: '#f97316', dasharray: '100.53 502.65', offset: -150.8 },
    { label: 'Medium', count:2742, color: '#eab308', dasharray: '125.66 502.65', offset: -251.33 },
    { label: 'Low', count: 2740, color: '#22c55e', dasharray: '125.66 502.65', offset: -376.99 }
  ];

  // All 28 States and 9 Union Territories of India
  const statesData = [
    // States
    { name: 'Andhra Pradesh', icon: '🏛️', totalCrimes: 890, type: 'state' },
    { name: 'Arunachal Pradesh', icon: '⛰️', totalCrimes: 120, type: 'state' },
    { name: 'Assam', icon: '🦏', totalCrimes: 650, type: 'state' },
    { name: 'Bihar', icon: '📚', totalCrimes: 1050, type: 'state' },
    { name: 'Chhattisgarh', icon: '🌾', totalCrimes: 480, type: 'state' },
    { name: 'Goa', icon: '🏖️', totalCrimes: 180, type: 'state' },
    { name: 'Gujarat', icon: '🏭', totalCrimes: 740, type: 'state' },
    { name: 'Haryana', icon: '🌾', totalCrimes: 620, type: 'state' },
    { name: 'Himachal Pradesh', icon: '🏔️', totalCrimes: 210, type: 'state' },
    { name: 'Jharkhand', icon: '⛏️', totalCrimes: 580, type: 'state' },
    { name: 'Karnataka', icon: '🌆', totalCrimes: 950, type: 'state' },
    { name: 'Kerala', icon: '🌴', totalCrimes: 520, type: 'state' },
    { name: 'Madhya Pradesh', icon: '🦁', totalCrimes: 890, type: 'state' },
    { name: 'Maharashtra', icon: '🏙️', totalCrimes: 1450, type: 'state' },
    { name: 'Manipur', icon: '💐', totalCrimes: 150, type: 'state' },
    { name: 'Meghalaya', icon: '☔', totalCrimes: 140, type: 'state' },
    { name: 'Mizoram', icon: '🎋', totalCrimes: 90, type: 'state' },
    { name: 'Nagaland', icon: '🎭', totalCrimes: 110, type: 'state' },
    { name: 'Odisha', icon: '🏛️', totalCrimes: 680, type: 'state' },
    { name: 'Punjab', icon: '🌾', totalCrimes: 560, type: 'state' },
    { name: 'Rajasthan', icon: '🏰', totalCrimes: 780, type: 'state' },
    { name: 'Sikkim', icon: '⛰️', totalCrimes: 80, type: 'state' },
    { name: 'Tamil Nadu', icon: '🛕', totalCrimes: 920, type: 'state' },
    { name: 'Telangana', icon: '💎', totalCrimes: 670, type: 'state' },
    { name: 'Tripura', icon: '🎪', totalCrimes: 170, type: 'state' },
    { name: 'Uttar Pradesh', icon: '🕌', totalCrimes: 1680, type: 'state' },
    { name: 'Uttarakhand', icon: '🏔️', totalCrimes: 290, type: 'state' },
    { name: 'West Bengal', icon: '🌉', totalCrimes: 1120, type: 'state' },
    // Union Territories
    { name: 'Andaman & Nicobar', icon: '🏝️', totalCrimes: 45, type: 'ut' },
    { name: 'Chandigarh', icon: '🏢', totalCrimes: 240, type: 'ut' },
    { name: 'Dadra & Nagar Haveli and Daman & Diu', icon: '🌊', totalCrimes: 95, type: 'ut' },
    { name: 'Delhi', icon: '🏛️', totalCrimes: 1380, type: 'ut' },
    { name: 'Jammu & Kashmir', icon: '🏔️', totalCrimes: 420, type: 'ut' },
    { name: 'Ladakh', icon: '🏔️', totalCrimes: 60, type: 'ut' },
    { name: 'Lakshadweep', icon: '🏝️', totalCrimes: 15, type: 'ut' },
    { name: 'Puducherry', icon: '🏖️', totalCrimes: 180, type: 'ut' },
    { name: 'The Government of NCT of Delhi', icon: '🏛️', totalCrimes: 1380, type: 'ut' }
  ];

  const getCitiesForState = (state) => {
    const cityData = {
      'Andhra Pradesh': [
        { name: 'Visakhapatnam', crimes: 320, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 68 },
        { name: 'Vijayawada', crimes: 280, commonCrime: 'Burglary', severity: 'Medium', safetyIndex: 70 },
        { name: 'Guntur', crimes: 190, commonCrime: 'Assault', severity: 'Low', safetyIndex: 74 }
      ],
      'Arunachal Pradesh': [
        { name: 'Itanagar', crimes: 45, commonCrime: 'Theft', severity: 'Low', safetyIndex: 88 },
        { name: 'Naharlagun', crimes: 35, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 90 },
        { name: 'Pasighat', crimes: 25, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 92 }
      ],
      'Assam': [
        { name: 'Guwahati', crimes: 280, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 69 },
        { name: 'Silchar', crimes: 180, commonCrime: 'Assault', severity: 'Low', safetyIndex: 73 },
        { name: 'Dibrugarh', crimes: 120, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 77 }
      ],
      'Bihar': [
        { name: 'Patna', crimes: 380, commonCrime: 'Robbery', severity: 'High', safetyIndex: 61 },
        { name: 'Gaya', crimes: 310, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 65 },
        { name: 'Bhagalpur', crimes: 240, commonCrime: 'Assault', severity: 'Medium', safetyIndex: 67 }
      ],
      'Chhattisgarh': [
        { name: 'Raipur', crimes: 210, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 72 },
        { name: 'Bhilai', crimes: 150, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 76 },
        { name: 'Bilaspur', crimes: 100, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 80 }
      ],
      'Goa': [
        { name: 'Panaji', crimes: 70, commonCrime: 'Theft', severity: 'Low', safetyIndex: 84 },
        { name: 'Margao', crimes: 55, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 86 },
        { name: 'Vasco da Gama', crimes: 45, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 88 }
      ],
      'Gujarat': [
        { name: 'Ahmedabad', crimes: 280, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 70 },
        { name: 'Surat', crimes: 160, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 77 },
        { name: 'Vadodara', crimes: 100, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 82 }
      ],
      'Haryana': [
        { name: 'Gurugram', crimes: 250, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 68 },
        { name: 'Faridabad', crimes: 180, commonCrime: 'Robbery', severity: 'Medium', safetyIndex: 71 },
        { name: 'Panipat', crimes: 120, commonCrime: 'Assault', severity: 'Low', safetyIndex: 75 }
      ],
      'Himachal Pradesh': [
        { name: 'Shimla', crimes: 80, commonCrime: 'Theft', severity: 'Low', safetyIndex: 85 },
        { name: 'Dharamshala', crimes: 55, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 88 },
        { name: 'Manali', crimes: 40, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 90 }
      ],
      'Jharkhand': [
        { name: 'Ranchi', crimes: 240, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 69 },
        { name: 'Jamshedpur', crimes: 180, commonCrime: 'Assault', severity: 'Medium', safetyIndex: 72 },
        { name: 'Dhanbad', crimes: 130, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 75 }
      ],
      'Karnataka': [
        { name: 'Bengaluru', crimes: 380, commonCrime: 'Cyber Crime', severity: 'High', safetyIndex: 64 },
        { name: 'Mysuru', crimes: 210, commonCrime: 'Theft', severity: 'Low', safetyIndex: 78 },
        { name: 'Mangaluru', crimes: 160, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 80 }
      ],
      'Kerala': [
        { name: 'Thiruvananthapuram', crimes: 180, commonCrime: 'Theft', severity: 'Low', safetyIndex: 79 },
        { name: 'Kochi', crimes: 130, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 81 },
        { name: 'Kozhikode', crimes: 70, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 87 }
      ],
      'Madhya Pradesh': [
        { name: 'Indore', crimes: 310, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 67 },
        { name: 'Bhopal', crimes: 280, commonCrime: 'Robbery', severity: 'Medium', safetyIndex: 69 },
        { name: 'Jabalpur', crimes: 200, commonCrime: 'Assault', severity: 'Low', safetyIndex: 73 }
      ],
      'Maharashtra': [
        { name: 'Mumbai', crimes: 450, commonCrime: 'Theft', severity: 'High', safetyIndex: 62 },
        { name: 'Pune', crimes: 320, commonCrime: 'Burglary', severity: 'Medium', safetyIndex: 71 },
        { name: 'Nagpur', crimes: 280, commonCrime: 'Assault', severity: 'Medium', safetyIndex: 68 }
      ],
      'Manipur': [
        { name: 'Imphal', crimes: 60, commonCrime: 'Theft', severity: 'Low', safetyIndex: 85 },
        { name: 'Thoubal', crimes: 45, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 87 },
        { name: 'Bishnupur', crimes: 30, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 90 }
      ],
      'Meghalaya': [
        { name: 'Shillong', crimes: 55, commonCrime: 'Theft', severity: 'Low', safetyIndex: 86 },
        { name: 'Tura', crimes: 40, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 88 },
        { name: 'Jowai', crimes: 30, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 91 }
      ],
      'Mizoram': [
        { name: 'Aizawl', crimes: 35, commonCrime: 'Theft', severity: 'Low', safetyIndex: 91 },
        { name: 'Lunglei', crimes: 25, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 93 },
        { name: 'Champhai', crimes: 20, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 94 }
      ],
      'Nagaland': [
        { name: 'Kohima', crimes: 45, commonCrime: 'Theft', severity: 'Low', safetyIndex: 88 },
        { name: 'Dimapur', crimes: 35, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 90 },
        { name: 'Mokokchung', crimes: 25, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 92 }
      ],
      'Odisha': [
        { name: 'Bhubaneswar', crimes: 280, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 70 },
        { name: 'Cuttack', crimes: 210, commonCrime: 'Assault', severity: 'Medium', safetyIndex: 73 },
        { name: 'Rourkela', crimes: 150, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 76 }
      ],
      'Punjab': [
        { name: 'Ludhiana', crimes: 200, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 73 },
        { name: 'Amritsar', crimes: 140, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 76 },
        { name: 'Jalandhar', crimes: 80, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 83 }
      ],
      'Rajasthan': [
        { name: 'Jaipur', crimes: 240, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 69 },
        { name: 'Jodhpur', crimes: 130, commonCrime: 'Assault', severity: 'Low', safetyIndex: 75 },
        { name: 'Udaipur', crimes: 80, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 85 }
      ],
      'Sikkim': [
        { name: 'Gangtok', crimes: 30, commonCrime: 'Theft', severity: 'Low', safetyIndex: 92 },
        { name: 'Namchi', crimes: 25, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 93 },
        { name: 'Gyalshing', crimes: 20, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 95 }
      ],
      'Tamil Nadu': [
        { name: 'Chennai', crimes: 340, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 67 },
        { name: 'Coimbatore', crimes: 220, commonCrime: 'Assault', severity: 'Medium', safetyIndex: 72 },
        { name: 'Madurai', crimes: 130, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 76 }
      ],
      'Telangana': [
        { name: 'Hyderabad', crimes: 290, commonCrime: 'Cyber Crime', severity: 'Medium', safetyIndex: 68 },
        { name: 'Warangal', crimes: 180, commonCrime: 'Theft', severity: 'Low', safetyIndex: 74 },
        { name: 'Nizamabad', crimes: 120, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 78 }
      ],
      'Tripura': [
        { name: 'Agartala', crimes: 70, commonCrime: 'Theft', severity: 'Low', safetyIndex: 84 },
        { name: 'Udaipur', crimes: 50, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 87 },
        { name: 'Dharmanagar', crimes: 35, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 89 }
      ],
      'Uttar Pradesh': [
        { name: 'Lucknow', crimes: 480, commonCrime: 'Robbery', severity: 'High', safetyIndex: 59 },
        { name: 'Kanpur', crimes: 350, commonCrime: 'Assault', severity: 'High', safetyIndex: 62 },
        { name: 'Agra', crimes: 270, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 66 }
      ],
      'Uttarakhand': [
        { name: 'Dehradun', crimes: 120, commonCrime: 'Theft', severity: 'Low', safetyIndex: 79 },
        { name: 'Haridwar', crimes: 90, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 82 },
        { name: 'Nainital', crimes: 60, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 86 }
      ],
      'West Bengal': [
        { name: 'Kolkata', crimes: 420, commonCrime: 'Robbery', severity: 'High', safetyIndex: 60 },
        { name: 'Howrah', crimes: 250, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 68 },
        { name: 'Siliguri', crimes: 150, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 74 }
      ],
      'Andaman & Nicobar': [
        { name: 'Port Blair', crimes: 20, commonCrime: 'Theft', severity: 'Low', safetyIndex: 94 },
        { name: 'Diglipur', crimes: 15, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 96 },
        { name: 'Car Nicobar', crimes: 10, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 97 }
      ],
      'Chandigarh': [
        { name: 'Chandigarh Sector 17', crimes: 90, commonCrime: 'Theft', severity: 'Low', safetyIndex: 81 },
        { name: 'Panchkula', crimes: 70, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 83 },
        { name: 'Mohali', crimes: 60, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 85 }
      ],
      'Dadra & Nagar Haveli and Daman & Diu': [
        { name: 'Daman', crimes: 35, commonCrime: 'Theft', severity: 'Low', safetyIndex: 90 },
        { name: 'Silvassa', crimes: 30, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 91 },
        { name: 'Diu', crimes: 25, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 93 }
      ],
      'Delhi': [
        { name: 'New Delhi', crimes: 520, commonCrime: 'Robbery', severity: 'High', safetyIndex: 58 },
        { name: 'Dwarka', crimes: 280, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 65 },
        { name: 'Rohini', crimes: 180, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 75 }
      ],
      'Jammu & Kashmir': [
        { name: 'Srinagar', crimes: 180, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 72 },
        { name: 'Jammu', crimes: 140, commonCrime: 'Assault', severity: 'Low', safetyIndex: 76 },
        { name: 'Anantnag', crimes: 90, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 80 }
      ],
      'Ladakh': [
        { name: 'Leh', crimes: 25, commonCrime: 'Theft', severity: 'Low', safetyIndex: 93 },
        { name: 'Kargil', crimes: 20, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 94 },
        { name: 'Nubra', crimes: 15, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 96 }
      ],
      'Lakshadweep': [
        { name: 'Kavaratti', crimes: 8, commonCrime: 'Theft', severity: 'Low', safetyIndex: 97 },
        { name: 'Agatti', crimes: 5, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 98 },
        { name: 'Minicoy', crimes: 2, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 99 }
      ],
      'Puducherry': [
        { name: 'Puducherry City', crimes: 80, commonCrime: 'Theft', severity: 'Low', safetyIndex: 82 },
        { name: 'Karaikal', crimes: 50, commonCrime: 'Burglary', severity: 'Low', safetyIndex: 86 },
        { name: 'Mahe', crimes: 40, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 88 }
      ],
      'The Government of NCT of Delhi': [
        { name: 'Central Delhi', crimes: 520, commonCrime: 'Robbery', severity: 'High', safetyIndex: 58 },
        { name: 'South Delhi', crimes: 280, commonCrime: 'Theft', severity: 'Medium', safetyIndex: 65 },
        { name: 'North Delhi', crimes: 180, commonCrime: 'Vandalism', severity: 'Low', safetyIndex: 75 }
      ]
    };
    return cityData[state] || [];
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${textPrimary}`}>{t?.analytics || 'Analytics'}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crime Type Distribution Bar Chart */}
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>Crime Type Distribution (Bar Chart)</h2>
          
          <div className="relative h-80 flex items-end justify-around gap-4 px-4 pb-2">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
              <span>4000</span>
              <span>3000</span>
              <span>2000</span>
              <span>1000</span>
              <span>0</span>
            </div>

            {/* Horizontal grid lines */}
            <div className="absolute left-10 right-0 top-0 bottom-8 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
              ))}
            </div>

            {/* Bars */}
            {histogramData.map((item, index) => {
              const maxCount = Math.max(...histogramData.map(d => d.count));
              const heightPercentage = (item.count / maxCount) * 100;
              
              return (
                <div 
                  key={item.type}
                  className="flex flex-col items-center flex-1 relative group"
                  onMouseEnter={() => setHoveredBar(index)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {/* Bar */}
                  <div className="w-full flex justify-center items-end h-72 relative">
                    <div
                      className={`w-full max-w-20 rounded-t-lg transition-all duration-700 ease-out cursor-pointer relative ${
                        hoveredBar === index ? 'shadow-2xl scale-105' : 'shadow-md'
                      }`}
                      style={{ 
                        height: animateHistogram ? `${heightPercentage}%` : '0%',
                        backgroundColor: item.color,
                        transitionDelay: `${index * 100}ms`
                      }}
                    >
                      {/* Value label on top of bar */}
                      <div 
                        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                          hoveredBar === index ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
                        }`}
                      >
                        {item.count} cases
                        <div className="absolute bottom-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                      </div>

                      {/* Percentage inside bar */}
                      {animateHistogram && heightPercentage > 15 && (
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white text-xs font-bold">
                          {Math.round((item.count / histogramData.reduce((sum, d) => sum + d.count, 0)) * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* X-axis label */}
                  <div className={`mt-2 text-xs font-medium text-center ${textPrimary} transition-all duration-300 ${
                    hoveredBar === index ? 'font-bold scale-110' : ''
                  }`}>
                    {item.type}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis line */}
          <div className={`w-full h-0.5 mt-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
        </div>

        {/* Priority Distribution Pie Chart */}
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 ${textPrimary}`}>Priority Distribution (Pie Chart)</h2>
          
          {/* Container with proper spacing */}
          <div className="flex flex-col items-center gap-6">
            {/* SVG Chart Container */}
            <div className="w-full flex justify-center h-72 relative">
              <svg viewBox="0 0 200 200" className="w-full h-full max-w-sm" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
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
                    
                    {/* Animated popup label on hover - positioned outside */}
                    {hoveredPieSegment === index && (
                      <g className="animate-popup">
                        <rect
                          x="70"
                          y="70"
                          width="60"
                          height="60"
                          fill={darkMode ? '#1f2937' : 'white'}
                          stroke={item.color}
                          strokeWidth="2"
                          rx="8"
                          className="shadow-lg"
                          style={{
                            animation: 'popup 0.3s ease-out'
                          }}
                        />
                        <text
                          x="100"
                          y="95"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={item.color}
                          fontSize="16"
                          fontWeight="bold"
                        >
                          {item.label}
                        </text>
                        <text
                          x="100"
                          y="115"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={item.color}
                          fontSize="20"
                          fontWeight="bold"
                        >
                          {item.count}
                        </text>
                      </g>
                    )}
                  </g>
                ))}

                {/* Center content - moved here for better positioning */}
                <g pointerEvents="none">
                  <text
                    x="100"
                    y="90"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textPrimary === 'text-gray-100' ? '#f3f4f6' : '#1f2937'}
                    fontSize="24"
                    fontWeight="bold"
                    className={hoveredPieSegment !== null ? 'opacity-40' : 'opacity-100'}
                    style={{ transition: 'opacity 0.3s' }}
                  >
                    10975
                  </text>
                  <text
                    x="100"
                    y="108"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={textTertiary === 'text-gray-400' ? '#9ca3af' : '#9ca3af'}
                    fontSize="10"
                    className={hoveredPieSegment !== null ? 'opacity-40' : 'opacity-100'}
                    style={{ transition: 'opacity 0.3s' }}
                  >
                    Total Cases
                  </text>
                </g>
              </svg>
            </div>

            {/* Legend - moved below the chart */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4 px-4">
              {pieData.map((item, index) => (
                <div 
                  key={item.label} 
                  className={`flex items-center gap-2 cursor-pointer transition-all duration-300 p-3 rounded-lg ${
                    hoveredPieSegment === index ? 'bg-opacity-20 scale-105 shadow-md' : 'bg-opacity-0'
                  }`}
                  style={{ backgroundColor: hoveredPieSegment === index ? item.color + '30' : 'transparent' }}
                  onMouseEnter={() => setHoveredPieSegment(index)}
                  onMouseLeave={() => setHoveredPieSegment(null)}
                >
                  <div 
                    className={`w-4 h-4 rounded transition-all duration-300 ${
                      hoveredPieSegment === index ? 'w-5 h-5 shadow-md ring-2' : ''
                    }`}
                    style={{ 
                      backgroundColor: item.color,
                      ringColor: item.color + '80'
                    }}
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
      </div>

      {/* State-wise Crime Analytics */}
      <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
        <h2 className={`text-xl font-semibold mb-6 ${textPrimary}`}>State-wise Crime Analytics</h2>
        
        {/* States Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {statesData.map((state) => (
            <button
              key={state.name}
              onClick={() => setSelectedState(state.name === selectedState ? null : state.name)}
              className={`p-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                selectedState === state.name 
                  ? darkMode 
                    ? 'bg-blue-600 shadow-lg shadow-blue-500/50 ring-2 ring-blue-400' 
                    : 'bg-blue-500 shadow-lg shadow-blue-300/50 ring-2 ring-blue-300'
                  : darkMode
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`text-2xl ${selectedState === state.name ? 'animate-bounce' : ''}`}>
                  {state.icon}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-semibold ${
                    selectedState === state.name 
                      ? 'text-white' 
                      : textPrimary
                  }`}>
                    {state.name}
                  </p>
                  <p className={`text-xs mt-1 ${
                    selectedState === state.name 
                      ? 'text-blue-100' 
                      : textTertiary
                  }`}>
                    {state.totalCrimes} cases
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* City-wise Analytics (shown when state is selected) */}
        {selectedState && (
          <div className="mt-6 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${textPrimary}`}>
                {selectedState} - Capital Cities Analysis
              </h3>
              <button
                onClick={() => setSelectedState(null)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCitiesForState(selectedState).map((city, idx) => (
                <div 
                  key={city.name}
                  className={`p-5 rounded-xl transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                    darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                  }`}
                  style={{
                    animationDelay: `${idx * 100}ms`,
                    animation: 'slideIn 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-semibold ${textPrimary}`}>{city.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      city.severity === 'High' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        : city.severity === 'Medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {city.severity}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={textSecondary}>Total Cases:</span>
                      <span className={`font-semibold ${textPrimary}`}>{city.crimes}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={textSecondary}>Most Common:</span>
                      <span className={`font-medium ${textPrimary}`}>{city.commonCrime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={textSecondary}>Safety Index:</span>
                      <span className={`font-semibold ${
                        city.safetyIndex >= 70 ? 'text-green-600 dark:text-green-400' :
                        city.safetyIndex >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {city.safetyIndex}%
                      </span>
                    </div>
                    
                    {/* Mini progress bar */}
                    <div className={`mt-3 rounded-full h-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          city.safetyIndex >= 70 ? 'bg-green-500' :
                          city.safetyIndex >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${city.safetyIndex}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
{/* Women's Safety and Patrol Recommendations - Dynamic based on selected state */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-lg shadow-md p-6 ${bgCard}`}>
          <h2 className={`text-xl font-semibold mb-4 flex items-center gap-2 ${textPrimary}`}>
            <Shield className="w-5 h-5 text-green-600" />
            {selectedState ? `${selectedState} - Women's Safety Zones` : "Women's Safety Index (Select a state)"}
          </h2>
          <div className="space-y-3">
            {getWomenSafetyZones(selectedState || 'Maharashtra').map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={`font-medium ${textPrimary}`}>{item.zone}</span>
                  <span className={`font-semibold ${
                    item.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    item.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>{item.safety}%</span>
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
            <Navigation className="w-5 h-5 text-blue-600" />
            {selectedState ? `${selectedState} - Patrol Routes` : "Patrol Recommendations (Select a state)"}
          </h2>
          <div className="space-y-3">
            {getPatrolRecommendations(selectedState || 'Maharashtra').map((route, i) => (
              <div key={i} className={`border rounded-lg p-4 transition ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:shadow-md'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-semibold ${textPrimary}`}>{route.route}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    route.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                    route.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Analytics;