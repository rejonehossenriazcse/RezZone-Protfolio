import React from 'react';
import { CMSProvider, useCMS } from './context/CMSContext';
import { PortfolioView } from './components/portfolio/PortfolioView';
import { SocialsView } from './components/portfolio/SocialsView';
import { AdminDashboard } from './components/admin/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentView } = useCMS();

  if (currentView === 'admin') {
    return <AdminDashboard />;
  }

  if (currentView === 'socials') {
    return <SocialsView />;
  }

  return <PortfolioView />;
};

export default function App() {
  return (
    <CMSProvider>
      <AppContent />
    </CMSProvider>
  );
}
