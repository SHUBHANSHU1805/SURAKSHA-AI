import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, checkAuth } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, profile, loading, error, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const handleLogin = async (email, password) => {
    try {
      await dispatch(login({ email, password })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleRegister = async (email, password, userData) => {
    try {
      await dispatch(register({ email, password, userData })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const initAuth = async () => {
    try {
      await dispatch(checkAuth()).unwrap();
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    initAuth
  };
};