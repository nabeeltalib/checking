import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/lib/react-query/QueryProvider";
import { ListProvider } from "@/context/ListContext";
import { CommentProvider } from "@/context/CommentContext";
import { SuggestionProvider } from "@/context/SuggestionContext";
import { CollaborationProvider } from "@/context/CollaborationContext";
import { EngagementProvider } from "@/context/EngagementContext";
import { RankingProvider } from "@/context/RankingContext";
import { DebateProvider } from "@/context/DebateContext";

import App from "./App";
import './globals.css'

const AppWrapper: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hideLoader = () => {
      const loader = document.getElementById('loader');
      if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
          loader.style.display = 'none';
          setIsLoading(false);
        }, 500); // Match this to the transition time in CSS
      }
    };

    // In production, you'd want to trigger hideLoader when your app is ready
    // For now, we'll use a timeout to simulate loading time
    const timer = setTimeout(hideLoader, 2000);

    return () => clearTimeout(timer);
  }, []);

  return <App isInitialLoading={isLoading} />;
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