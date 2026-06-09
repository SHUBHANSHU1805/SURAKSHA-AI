import { useSelector, useDispatch } from 'react-redux';
import { 
  submitFIR, 
  fetchFIRs, 
  fetchFIRDetails,
  modifyFIR,
  removeFIR,
  setFilters,
  clearFilters,
  clearSelectedFIR
} from '../redux/slices/firSlice';

export const useFIR = () => {
  const dispatch = useDispatch();
  const { 
    firs, 
    selectedFIR, 
    loading, 
    error, 
    filters,
    submitSuccess 
  } = useSelector((state) => state.fir);

  const handleSubmitFIR = async (firData) => {
    try {
      await dispatch(submitFIR(firData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const loadFIRs = async (customFilters = {}) => {
    try {
      const filterParams = { ...filters, ...customFilters };
      await dispatch(fetchFIRs(filterParams)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const loadFIRDetails = async (firId) => {
    try {
      await dispatch(fetchFIRDetails(firId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateFIR = async (firId, updates) => {
    try {
      await dispatch(modifyFIR({ firId, updates })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteFIR = async (firId) => {
    try {
      await dispatch(removeFIR(firId)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const applyFilters = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  const clearSelection = () => {
    dispatch(clearSelectedFIR());
  };

  return {
    firs,
    selectedFIR,
    loading,
    error,
    filters,
    submitSuccess,
    submitFIR: handleSubmitFIR,
    loadFIRs,
    loadFIRDetails,
    updateFIR,
    deleteFIR,
    applyFilters,
    resetFilters,
    clearSelection
  };
};