import React, { createContext, useContext, useState, ReactNode } from "react";
import { ISuggestion } from "@/types";

interface SuggestionContextProps {
  suggestions: ISuggestion[];
  addSuggestion: (suggestion: ISuggestion) => void;
  updateSuggestion: (id: string, updatedSuggestion: Partial<ISuggestion>) => void;
  deleteSuggestion: (id: string) => void;
}

const SuggestionContext = createContext<SuggestionContextProps | undefined>(undefined);

export const SuggestionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [suggestions, setSuggestions] = useState<ISuggestion[]>([]);

  const addSuggestion = (suggestion: ISuggestion) => {
    setSuggestions((prevSuggestions) => [...prevSuggestions, suggestion]);
  };

  const updateSuggestion = (id: string, updatedSuggestion: Partial<ISuggestion>) => {
    setSuggestions((prevSuggestions) =>
      prevSuggestions.map((suggestion) =>
        suggestion.id === id ? { ...suggestion, ...updatedSuggestion } : suggestion
      )
    );
  };

  const deleteSuggestion = (id: string) => {
    setSuggestions((prevSuggestions) => prevSuggestions.filter((suggestion) => suggestion.id !== id));
  };

  return (
    <SuggestionContext.Provider value={{ suggestions, addSuggestion, updateSuggestion, deleteSuggestion }}>
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