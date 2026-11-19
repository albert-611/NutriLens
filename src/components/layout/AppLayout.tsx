import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface-lightRoot dark:bg-forest-root text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <AppHeader
          onMobileMenuToggle={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 p-4 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

