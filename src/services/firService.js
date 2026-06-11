// Create new FIR
export const createFIR = async (firData) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/crimes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...firData,
        status: 'Reported'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create FIR: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('FIR created with ID:', data.data?.id);
    return data.data?.id || data.id;
  } catch (error) {
    console.error('Error creating FIR:', error);
    throw error;
  }
};

// Get all FIRs with optional filters
export const getAllFIRs = async (filters = {}) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.crimeType) params.append('crimeType', filters.crimeType);
    if (filters.severity) params.append('severity', filters.severity);
    if (filters.status) params.append('status', filters.status);
    params.append('limit', filters.limit || 100);
    
    const response = await fetch(`${apiUrl}/crimes/?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch FIRs: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform backend response to expected format
    const firs = (data.data?.crimes || []).map(crime => ({
      id: crime.id,
      crimeType: crime.crimeType,
      severity: crime.severity,
      status: crime.status,
      createdAt: crime.createdAt || new Date().toISOString(),
      location: crime.location || {},
      ...crime
    }));
    
    return firs;
  } catch (error) {
    console.error('Error fetching FIRs:', error);
    // Fallback to empty array instead of throwing
    return [];
  }
};

// Get single FIR by ID
export const getFIRById = async (firId) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/crimes/${firId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`FIR not found: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching FIR:', error);
    throw error;
  }
};

// Update FIR
export const updateFIR = async (firId, updates) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/crimes/${firId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update FIR: ${response.status}`);
    }
    
    console.log('FIR updated:', firId);
  } catch (error) {
    console.error('Error updating FIR:', error);
    throw error;
  }
};

// Delete FIR
export const deleteFIR = async (firId) => {
  try {
    const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${apiUrl}/crimes/${firId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete FIR: ${response.status}`);
    }
    
    console.log('FIR deleted:', firId);
  } catch (error) {
    console.error('Error deleting FIR:', error);
    throw error;
  }
};

// Get FIRs by date range
export const getFIRsByDateRange = async (startDate, endDate) => {
  try {
    const firs = await getAllFIRs();
    // Filter on client side
    return firs.filter(fir => {
      const firDate = new Date(fir.createdAt);
      return firDate >= startDate && firDate <= endDate;
    });
  } catch (error) {
    console.error('Error fetching FIRs by date:', error);
    throw error;
  }
};

// Get crime statistics
export const getCrimeStatistics = async () => {
  try {
    const firs = await getAllFIRs();
    
    const stats = {
      total: firs.length,
      byType: {},
      bySeverity: {},
      byStatus: {},
      byState: {}
    };
    
    firs.forEach(fir => {
      // By type
      stats.byType[fir.crimeType] = (stats.byType[fir.crimeType] || 0) + 1;
      
      // By severity
      stats.bySeverity[fir.severity] = (stats.bySeverity[fir.severity] || 0) + 1;
      
      // By status
      stats.byStatus[fir.status] = (stats.byStatus[fir.status] || 0) + 1;
      
      // By state
      if (fir.location?.state) {
        stats.byState[fir.location.state] = (stats.byState[fir.location.state] || 0) + 1;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error calculating statistics:', error);
    throw error;
  }
};