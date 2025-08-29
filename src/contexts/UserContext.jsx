import React, { createContext, useState, useEffect } from 'react';
import authService from '../api/authService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Try to get fresh user data from API
          const userData = await authService.getCurrentUser();
          setCurrentUser(userData.user);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to stored user data
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setCurrentUser(storedUser);
          } else {
            // If no valid data, sign out
            authService.signout();
          }
        }
      }
      setIsLoading(false);
    };
    
    initializeUser();
  }, []);

  const login = (userData) => {
    setCurrentUser(userData);
    // Token and user data are already stored by authService
  };

  const logout = () => {
    setCurrentUser(null);
    authService.signout();
  };

  const updateUser = async (updatedData) => {
    try {
      const response = await authService.updateProfile(updatedData);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    updateUser,
    isLoggedIn: !!currentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;