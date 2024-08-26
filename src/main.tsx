import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { ListProvider } from "@/context/ListContext";
import { CommentProvider } from "@/context/CommentContext";
import { SuggestionProvider } from "@/context/SuggestionContext";
import { CollaborationProvider } from "@/context/CollaborationContext";

import App from "./App";
import './globals.css';

const AppWrapper: React.FC = () => {
  useEffect(() => {
    const hideLoader = () => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
      }
    };

    const timer = setTimeout(hideLoader, 1000); // Adjust the delay as needed

    return () => clearTimeout(timer);
  }, []);

  return <App />;
};

const root = ReactDOM.createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <ListProvider>
          <AuthProvider>
            <CommentProvider>
              <SuggestionProvider>
                <CollaborationProvider>
                  <AppWrapper />
                </CollaborationProvider>
              </SuggestionProvider>
            </CommentProvider>
          </AuthProvider>
        </ListProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
