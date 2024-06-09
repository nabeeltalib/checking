import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import './globals.css';

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { ListProvider } from "@/context/ListContext"; // Ensure ListProvider is imported if it's used globally
import { CommentProvider } from "@/context/CommentContext"; // Hypothetical provider for comments
import { SuggestionProvider } from "@/context/SuggestionContext"; // Hypothetical provider for suggestions
import { CollaborationProvider } from "@/context/CollaborationContext"; // Hypothetical provider for collaborations

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <AuthProvider>
          <ListProvider> {/* Ensuring ListProvider is included */}
            <CommentProvider> {/* Hypothetical providers for new features */}
              <SuggestionProvider>
                <CollaborationProvider>
                  <App />
                </CollaborationProvider>
              </SuggestionProvider>
            </CommentProvider>
          </ListProvider>
        </AuthProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
