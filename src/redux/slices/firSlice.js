import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createFIR, 
  getAllFIRs, 
  getFIRById, 
  updateFIR, 
  deleteFIR,
  getCrimeStatistics 
} from '../../services/firService';

// Async thunks
export const submitFIR = createAsyncThunk(
  'fir/submit',
  async (firData, { rejectWithValue }) => {
    try {
      const id = await createFIR(firData);
      return { id, ...firData };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFIRs = createAsyncThunk(
  'fir/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const firs = await getAllFIRs(filters);
      return firs;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchFIRDetails = createAsyncThunk(
  'fir/fetchDetails',
  async (firId, { rejectWithValue }) => {
    try {
      const fir = await getFIRById(firId);
      return fir;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const modifyFIR = createAsyncThunk(
  'fir/update',
  async ({ firId, updates }, { rejectWithValue }) => {
    try {
      await updateFIR(firId, updates);
      return { firId, updates };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFIR = createAsyncThunk(
  'fir/delete',
  async (firId, { rejectWithValue }) => {
    try {
      await deleteFIR(firId);
      return firId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStatistics = createAsyncThunk(
  'fir/fetchStatistics',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getCrimeStatistics();
      return stats;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const firSlice = createSlice({
  name: 'fir',
  initialState: {
    firs: [],
    selectedFIR: null,
    statistics: null,
    loading: false,
    error: null,
    filters: {
      state: '',
      city: '',
      crimeType: '',
      severity: '',
      status: ''
    },
    submitSuccess: false
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        state: '',
        city: '',
        crimeType: '',
        severity: '',
        status: ''
      };
    },
    clearSelectedFIR: (state) => {
      state.selectedFIR = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSubmitSuccess: (state) => {
      state.submitSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Submit FIR
      .addCase(submitFIR.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitFIR.fulfilled, (state, action) => {
        state.loading = false;
        state.firs.unshift(action.payload);
        state.submitSuccess = true;
      })
      .addCase(submitFIR.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit FIR';
        state.submitSuccess = false;
      })
      
      // Fetch FIRs
      .addCase(fetchFIRs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFIRs.fulfilled, (state, action) => {
        state.loading = false;
        state.firs = action.payload;
      })
      .addCase(fetchFIRs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch FIRs';
      })
      
      // Fetch FIR Details
      .addCase(fetchFIRDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFIRDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFIR = action.payload;
      })
      .addCase(fetchFIRDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch FIR details';
      })
      
      // Update FIR
      .addCase(modifyFIR.fulfilled, (state, action) => {
        const index = state.firs.findIndex(fir => fir.id === action.payload.firId);
        if (index !== -1) {
          state.firs[index] = { ...state.firs[index], ...action.payload.updates };
        }
        if (state.selectedFIR?.id === action.payload.firId) {
          state.selectedFIR = { ...state.selectedFIR, ...action.payload.updates };
        }
      })
      
      // Delete FIR
      .addCase(removeFIR.fulfilled, (state, action) => {
        state.firs = state.firs.filter(fir => fir.id !== action.payload);
        if (state.selectedFIR?.id === action.payload) {
          state.selectedFIR = null;
        }
      })
      
      // Fetch Statistics
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

export const { 
  setFilters, 
  clearFilters, 
  clearSelectedFIR, 
  clearError,
  resetSubmitSuccess 
} = firSlice.actions;

export default firSlice.reducer;