'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from '../components/Dashboard/AuthModal';

interface AuthModalContextType {
  openAuthModal: (promptMessage?: string, onAuthenticated?: (userId: string) => void | Promise<void>) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string | undefined>(undefined);
  const [onAuthenticated, setOnAuthenticated] = useState<((userId: string) => void | Promise<void>) | undefined>();

  const openAuthModal = (message?: string, onSuccess?: (userId: string) => void | Promise<void>) => {
    setPromptMessage(message);
    setOnAuthenticated(() => onSuccess);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
    setOnAuthenticated(undefined);
  };

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal }}>
      {children}
      <AuthModal isOpen={isOpen} onClose={closeAuthModal} onAuthenticated={onAuthenticated} promptMessage={promptMessage} />
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
