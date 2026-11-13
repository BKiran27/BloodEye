import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Eye, 
  LayoutDashboard, 
  ImagePlus, 
  Database, 
  BrainCircuit, 
  LineChart, 
  Search, 
  History, 
  FileText,
  Menu,
  X
} from 'lucide-react';
import { DisclaimerBanner } from './DisclaimerBanner';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/analysis', label: 'Eye Image Analysis', icon: ImagePlus },
    { path: '/datasets', label: 'Dataset Management', icon: Database },
    { path: '/training', label: 'Model Training', icon: BrainCircuit },
    { path: '/evaluation', label: 'Model Evaluation', icon: LineChart },
    { path: '/xai', label: 'Explainable AI', icon: Search },
    { path: '/history', label: 'Experiment History', icon: History },
    { path: '/reports', label: 'Reports', icon: FileText },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Get current page title
  const currentNav = navItems.find(item => item.path === location.pathname);
  const pageTitle = currentNav ? currentNav.label : 'BloodEye';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-navy-900/50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-navy-900 text-white transform transition-transform duration-300 ease-in-out lg:transform-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-navy-950 border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <Eye className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-bold tracking-wide">BloodEye</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="py-4">
          <p className="px-6 text-xs font-semibold text-navy-400 uppercase tracking-wider mb-2">Research Tools</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-6 py-3 text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-navy-800 text-cyan-400 border-r-4 border-cyan-400' 
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${location.pathname === item.path ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-6 border-t border-navy-800 bg-navy-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-300 font-bold">
              R
            </div>
            <div>
              <p className="text-sm font-medium">Researcher View</p>
              <p className="text-xs text-navy-400">v1.0.0-beta</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DisclaimerBanner />
        
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-4 sm:px-6 lg:px-8 z-10 shrink-0">
          <button 
            onClick={toggleSidebar} 
            className="mr-4 text-slate-500 hover:text-navy-900 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold text-navy-900">{pageTitle}</h1>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
