import { createContext, useContext, useState, ReactNode } from "react";

interface SuggestionContextProps {
  suggestions: any[];
  addSuggestion: (suggestion: any) => void;
}

const SuggestionContext = createContext<SuggestionContextProps | undefined>(undefined);

export const SuggestionProvider = ({ children }: { children: ReactNode }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const addSuggestion = (suggestion: any) => {
    setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
  };

  return (
    <SuggestionContext.Provider value={{ suggestions, addSuggestion }}>
      {children}
    </SuggestionContext.Provider>
  );
};

export const useSuggestionContext = () => {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error("useSuggestionContext must be used within a SuggestionProvider");
  }
  return context;
};
