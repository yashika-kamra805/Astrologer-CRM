import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function PageLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard')) return 'Dashboard Overview';
    if (pathname.startsWith('/clients')) {
      if (pathname.endsWith('/edit')) return 'Edit Client Details';
      if (pathname.match(/\/clients\/[a-f0-9]+$/)) return 'Client Profile & History';
      return 'Client Database';
    }
    if (pathname.startsWith('/consultations')) {
      if (pathname.endsWith('/edit')) return 'Edit Consultation Log';
      if (pathname.endsWith('/new')) return 'New Consultation Session';
      return 'Consultation Logs';
    }
    if (pathname.startsWith('/follow-ups')) return 'Follow-Up Schedule';
    return 'AstroCRM Workspace';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
