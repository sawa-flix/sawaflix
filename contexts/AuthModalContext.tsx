'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from '../components/Dashboard/AuthModal';

interface AuthModalContextType {
  openAuthModal: (promptMessage?: string) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | undefined>(undefined);

  const openAuthModal = (message?: string) => {
    setPromptMessage(message);
    setIsOpen(true);
  };

  const closeAuthModal = () => setIsOpen(false);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} promptMessage={promptMessage} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return ctx;
}
