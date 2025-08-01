import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  BarChart3, 
  Building, 
  Settings,
  ChevronLeft,
  Home
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCompany } from '../../context/CompanyContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Companies', href: '/companies', icon: Building },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { selectedCompany } = useCompany();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Logo and Company Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Home className="h-8 w-8 text-blue-600" />
          </div>
          {isOpen && (
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">VyapaarClone</h1>
              <p className="text-sm text-gray-500 truncate">{selectedCompany.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 h-5 w-5 transition-colors duration-200",
                  isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {isOpen && (
                <span className="ml-3 truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Company Logo at Bottom */}
      {isOpen && selectedCompany.logo && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <img
              src={selectedCompany.logo}
              alt={selectedCompany.name}
              className="h-10 w-10 rounded-lg object-cover"
            />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedCompany.name}
              </p>
              <p className="text-xs text-gray-500">Active Company</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;