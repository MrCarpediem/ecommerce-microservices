import React, { createContext, useContext, useState, useEffect } from 'react';
import UserService from '../services/userService';


const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const initializeUser = async () => {
      try {
       
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
          setCurrentUser(userData);
          
          
          const profile = await UserService.getUserProfile();
          setUserProfile(profile);
        }
      } catch (err) {
        console.error("Failed to initialize user context:", err);
        setError("Error initializing user data");
        
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  
  const login = async (token, userData) => {
    try {
      
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      
      setCurrentUser(userData);
      
     
      const profile = await UserService.getUserProfile();
      setUserProfile(profile);
      
      return { success: true };
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to log in");
      return { success: false, error: err.message };
    }
  };

  
  const logout = () => {
    
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    
   
    setCurrentUser(null);
    setUserProfile(null);
  };

 
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedProfile = await UserService.updateUserProfile(profileData);
      setUserProfile({
        ...userProfile,
        ...updatedProfile.profile
      });
      return { success: true, profile: updatedProfile.profile };
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile");
      return { success: false, error: err.message };
    }
  };

  
  const getFullName = () => {
    if (!userProfile) return '';
    return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
  };

  
  const isAuthenticated = () => {
    return !!currentUser && !!localStorage.getItem('token');
  };


  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    login,
    logout,
    updateProfile,
    getFullName,
    isAuthenticated
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
