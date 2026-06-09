import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Create new FIR
export const createFIR = async (firData) => {
  try {
    const docRef = await addDoc(collection(db, 'firs'), {
      ...firData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      status: 'Reported'
    });
    
    console.log('FIR created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating FIR:', error);
    throw error;
  }
};

// Get all FIRs with optional filters
export const getAllFIRs = async (filters = {}) => {
  try {
    let q = collection(db, 'firs');
    const constraints = [];
    
    // Apply filters
    if (filters.state) {
      constraints.push(where('location.state', '==', filters.state));
    }
    if (filters.city) {
      constraints.push(where('location.city', '==', filters.city));
    }
    if (filters.crimeType) {
      constraints.push(where('crimeType', '==', filters.crimeType));
    }
    if (filters.severity) {
      constraints.push(where('severity', '==', filters.severity));
    }
    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    
    // Add ordering
    constraints.push(orderBy('createdAt', 'desc'));
    
    // Add limit
    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }
    
    if (constraints.length > 0) {
      q = query(q, ...constraints);
    }
    
    const querySnapshot = await getDocs(q);
    const firs = [];
    
    querySnapshot.forEach((doc) => {
      firs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
      });
    });
    
    return firs;
  } catch (error) {
    console.error('Error fetching FIRs:', error);
    throw error;
  }
};

// Get single FIR by ID
export const getFIRById = async (firId) => {
  try {
    const docRef = doc(db, 'firs', firId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { 
        id: docSnap.id, 
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
        updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date()
      };
    } else {
      throw new Error('FIR not found');
    }
  } catch (error) {
    console.error('Error fetching FIR:', error);
    throw error;
  }
};

// Update FIR
export const updateFIR = async (firId, updates) => {
  try {
    const docRef = doc(db, 'firs', firId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
    console.log('FIR updated:', firId);
  } catch (error) {
    console.error('Error updating FIR:', error);
    throw error;
  }
};

// Delete FIR
export const deleteFIR = async (firId) => {
  try {
    await deleteDoc(doc(db, 'firs', firId));
    console.log('FIR deleted:', firId);
  } catch (error) {
    console.error('Error deleting FIR:', error);
    throw error;
  }
};

// Get FIRs by date range
export const getFIRsByDateRange = async (startDate, endDate) => {
  try {
    const q = query(
      collection(db, 'firs'),
      where('incidentDate', '>=', Timestamp.fromDate(startDate)),
      where('incidentDate', '<=', Timestamp.fromDate(endDate)),
      orderBy('incidentDate', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const firs = [];
    
    querySnapshot.forEach((doc) => {
      firs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        incidentDate: doc.data().incidentDate?.toDate?.() || new Date()
      });
    });
    
    return firs;
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