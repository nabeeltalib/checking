// ShareDialogContext.tsx
import React, { createContext, useState, useContext } from 'react';

type ShareDialogContextType = {
  isOpen: boolean;
  shareUrl: string;
  title: string;
  openShareDialog: (url: string, title: string) => void;
  closeShareDialog: () => void;
};

const ShareDialogContext = createContext<ShareDialogContextType | undefined>(undefined);

export const ShareDialogProvider: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [title, setTitle] = useState('');

  const openShareDialog = (url: string, title: string) => {
    setShareUrl(url);
    setTitle(title);
    setIsOpen(true);
  };

  const closeShareDialog = () => setIsOpen(false);

  return (
    <ShareDialogContext.Provider value={{ isOpen, shareUrl, title, openShareDialog, closeShareDialog }}>
      {children}
    </ShareDialogContext.Provider>
  );
};

export const useShareDialog = () => {
  const context = useContext(ShareDialogContext);
  if (context === undefined) {
    throw new Error('useShareDialog must be used within a ShareDialogProvider');
  }
  return context;
};