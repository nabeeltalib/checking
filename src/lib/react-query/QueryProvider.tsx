import React from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// Create a new instance of QueryClient with default settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests twice
      retry: 2,
      // Cache data for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Automatically refetch data in the background when data is stale
      refetchOnWindowFocus: true,
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
