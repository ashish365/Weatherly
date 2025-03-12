import React, { Suspense } from "react";
import styled from "styled-components";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const WeatherDashboard = React.lazy(
  () => import("./components/WeatherDashboard")
);

const LoadingFallback = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;
  color: #666;
`;

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback>Loading...</LoadingFallback>}>
        <WeatherDashboard />
      </Suspense>
    </QueryClientProvider>
  );
};

export default App;
