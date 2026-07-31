import React, { useState, useEffect } from "react";
import { MapPin, Loader } from "lucide-react";
import axios from "axios";

const SubmitFIR = ({ formData, setFormData, handleSubmitFIR, darkMode, t }) => {
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const textPrimary = darkMode ? "text-gray-100" : "text-gray-800";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textTertiary = darkMode ? "text-gray-400" : "text-gray-600";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";
  const inputBg = darkMode ? "bg-gray-700" : "bg-white";

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setGeocodingLoading(true);
    try {
      const searchQuery = query.toLowerCase().includes("india") ? query : `${query}, India`;
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: searchQuery, format: "json", countrycodes: "in", limit: 5 },
      });

      if (response.data && response.data.length > 0) {
        setAddressSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      setAddressSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.location) fetchSuggestions(formData.location);
    }, 400);
    return () => clearTimeout(timer);
  }, [formData.location]);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const coords = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      displayName: suggestion.display_name,
    };

    // Update coordinates for pin display
    setCoordinates(coords);

    // Update formData safely
    setFormData((prev) => ({
      ...prev,
      location: coords.displayName,
      lat: coords.lat,
      lng: coords.lng,
    }));

    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  // GPS button
  const getUserLocation = () => {
    setGeocodingLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      setGeocodingLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          displayName: `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
        };

        setCoordinates(coords);

        setFormData((prev) => ({
          ...prev,
          location: coords.displayName,
          lat: coords.lat,
          lng: coords.lng,
        }));

        setShowSuggestions(false);
        setAddressSuggestions([]);
        setGeocodingLoading(false);
      },
      (error) => {
        alert("Unable to get location");
        console.error(error);
        setGeocodingLoading(false);
      }
    );
  };

  // --- UI remains the same ---
  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-lg shadow-md p-8 ${bgCard}`}>
        <h1 className={`text-3xl font-bold mb-6 ${textPrimary}`}>{t.submitFIR}</h1>
        <div className="space-y-6">
          {/* Crime Type */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.crimeType}</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputBg} ${borderColor} ${textPrimary}`}
            >
              <option value="">Select crime type</option>
              <option value="Robbery">Robbery</option>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Burglary">Burglary</option>
              <option value="Vandalism">Vandalism</option>
              <option value="Vehicle Theft">Vehicle Theft</option>
              <option value="Fraud">Fraud</option>
              <option value="Chain Snatching">Chain Snatching</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.location}</label>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputBg} ${borderColor} ${textPrimary}`}
                    placeholder="Enter location"
                  />
                  {geocodingLoading && (
                    <div className="absolute right-3 top-2.5">
                      <Loader className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                  {!geocodingLoading && coordinates && (
                    <div className="absolute right-3 top-2.5">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={getUserLocation}
                  disabled={geocodingLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                >
                  <MapPin className="w-4 h-4" /> GPS
                </button>
              </div>

              {showSuggestions && addressSuggestions.length > 0 && (
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto ${bgCard} ${borderColor}`}>
                  {addressSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full text-left px-4 py-3 transition border-b last:border-b-0 ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                    >
                      <p className={`text-sm font-medium ${textPrimary}`}>{suggestion.display_name.split(",")[0]}</p>
                      <p className={`text-xs ${textTertiary} mt-1`}>
                        {suggestion.display_name.split(",").slice(1, 3).join(",").trim()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {coordinates && (
              <div className={`mt-3 p-3 rounded-lg ${darkMode ? "bg-gray-700" : "bg-blue-50"} border ${darkMode ? "border-gray-600" : "border-blue-200"}`}>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className={`text-xs font-semibold ${darkMode ? "text-green-400" : "text-green-700"}`}>Location Detected</p>
                    <p className={`text-xs mt-1 ${textTertiary}`}>{coordinates.displayName}</p>
                    <div className="flex gap-4 mt-2">
                      <span className={`text-xs font-mono ${textTertiary}`}>Lat: {coordinates.lat}</span>
                      <span className={`text-xs font-mono ${textTertiary}`}>Lng: {coordinates.lng}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Severity */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.severity}</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputBg} ${borderColor} ${textPrimary}`}
            >
              <option value="">Select severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${textSecondary}`}>{t.description}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${inputBg} ${borderColor} ${textPrimary}`}
              rows="4"
              placeholder="Enter detailed description"
            />
          </div>

          {/* Submit */}
          <button
            onClick={() => handleSubmitFIR({ ...formData, lat: coordinates?.lat, lng: coordinates?.lng })}
            disabled={!formData.location || !coordinates}
            className={`w-full font-semibold py-3 rounded-lg transition shadow-md ${
              !formData.location || !coordinates
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {t.submit}
          </button>

          {(!formData.location || !coordinates) && (
            <p className={`text-xs text-center ${textTertiary}`}>Please enter or detect a location to submit FIR</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitFIR;
