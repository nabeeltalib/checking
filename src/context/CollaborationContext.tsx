import { createContext, useContext, useState, ReactNode } from "react";

interface CollaborationContextProps {
  collaborations: any[];
  addCollaboration: (collaboration: any) => void;
}

const CollaborationContext = createContext<CollaborationContextProps | undefined>(undefined);

export const CollaborationProvider = ({ children }: { children: ReactNode }) => {
  const [collaborations, setCollaborations] = useState<any[]>([]);

  const addCollaboration = (collaboration: any) => {
    setCollaborations((prevCollaborations) => [...prevCollaborations, collaboration]);
  };

  return (
    <CollaborationContext.Provider value={{ collaborations, addCollaboration }}>
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error("useCollaborationContext must be used within a CollaborationProvider");
  }
  return context;
};
