import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import './globals.css';

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { ListProvider } from "@/context/ListContext";
import { CommentProvider } from "@/context/CommentContext";
import { SuggestionProvider } from "@/context/SuggestionContext";
import { CollaborationProvider } from "@/context/CollaborationContext";

import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ListProvider>
          <AuthProvider>
            <CommentProvider>
              <SuggestionProvider>
                <CollaborationProvider>
                  <App />
                </CollaborationProvider>
              </SuggestionProvider>
            </CommentProvider>
          </AuthProvider>
        </ListProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);