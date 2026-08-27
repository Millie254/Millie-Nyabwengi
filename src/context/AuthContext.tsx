import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPersona, RoleType } from '../types/fhir';
import { USER_PERSONAS } from '../data/fhirMockDatabase';

interface AuthContextType {
  currentUser: UserPersona;
  allUsers: UserPersona[];
  switchUser: (userId: string) => void;
  switchRole: (role: RoleType) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona>(USER_PERSONAS[0]); // Default to Dr. Vance

  const switchUser = (userId: string) => {
    const user = USER_PERSONAS.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const switchRole = (role: RoleType) => {
    const user = USER_PERSONAS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, allUsers: USER_PERSONAS, switchUser, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
