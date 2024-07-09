import React, { createContext, useContext, useState, ReactNode } from "react";
import { ICollaboration } from "@/types";

interface CollaborationContextProps {
  collaborations: ICollaboration[];
  addCollaboration: (collaboration: ICollaboration) => void;
  updateCollaboration: (id: string, updatedCollaboration: Partial<ICollaboration>) => void;
}

const CollaborationContext = createContext<CollaborationContextProps | undefined>(undefined);

export const CollaborationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collaborations, setCollaborations] = useState<ICollaboration[]>([]);

  const addCollaboration = (collaboration: ICollaboration) => {
    setCollaborations((prevCollaborations) => [...prevCollaborations, collaboration]);
  };

  const updateCollaboration = (id: string, updatedCollaboration: Partial<ICollaboration>) => {
    setCollaborations((prevCollaborations) =>
      prevCollaborations.map((collab) =>
        collab.id === id ? { ...collab, ...updatedCollaboration } : collab
      )
    );
  };

  return (
    <CollaborationContext.Provider value={{ collaborations, addCollaboration, updateCollaboration }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaborationContext = (): CollaborationContextProps => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error("useCollaborationContext must be used within a CollaborationProvider");
  }
  return context;
};