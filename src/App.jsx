import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Layout } from './components/layout/Layout';
import { LoginView } from './components/auth/LoginView';
import { PublicLandingPage } from './components/public/PublicLandingPage';
import './styles/global.css';
import './styles/components.css';

function MainAppContent() {
  const { isAuthenticated, viewMode } = useCRM();

  // If user is on the public landing page
  if (viewMode === 'public') {
    return <PublicLandingPage />;
  }

  // If user wants to login or is unauthenticated
  if (viewMode === 'login' || !isAuthenticated) {
    return <LoginView />;
  }

  // Authenticated company workspace dashboard
  return <Layout />;
}

export default function App() {
  return (
    <ThemeProvider>
      <CRMProvider>
        <MainAppContent />
      </CRMProvider>
    </ThemeProvider>
  );
}
