import React, { useEffect } from "react";
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

const AppWrapper = () => {
  useEffect(() => {
    // Hide the loader after the app has mounted
    const hideLoader = () => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.style.display = 'none';
      }
    };

    // Use a slight delay to ensure all components have had a chance to render
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
