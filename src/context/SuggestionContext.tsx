import React, { createContext, useContext, useState, ReactNode } from "react";
import { ISuggestion } from "@/types";

interface SuggestionContextProps {
  suggestions: ISuggestion[];
  addSuggestion: (suggestion: ISuggestion) => void;
}

const SuggestionContext = createContext<SuggestionContextProps | undefined>(undefined);

export const SuggestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);

  const addSuggestion = (suggestion: ISuggestion) => {
    setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
  };

  return (
    <SuggestionContext.Provider value={{ suggestions, addSuggestion }}>
      {children}
    </SuggestionContext.Provider>
  );
};

export const useSuggestionContext = (): SuggestionContextProps => {
  const context = useContext(SuggestionContext);
  if (context === undefined) {
    throw new Error("useSuggestionContext must be used within a SuggestionProvider");
  }
  return context;
};