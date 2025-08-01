import React, { useState } from 'react';
import { Menu, Bell, Search, User, ChevronDown, Building2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { useCompany } from '../../context/CompanyContext';

const Header = ({ toggleSidebar }) => {
  const [notifications] = useState([
    { id: 1, message: 'Invoice INV-001 is overdue', type: 'warning', time: '2m ago' },
    { id: 2, message: 'New customer added', type: 'info', time: '1h ago' },
    { id: 3, message: 'Low stock alert for Cotton T-Shirt', type: 'alert', time: '3h ago' },
  ]);

  const { selectedCompany, companies, switchCompany } = useCompany();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search invoices, customers..."
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Company Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">{selectedCompany.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => switchCompany(company)}
                  className="flex items-center space-x-2"
                >
                  {company.logo && (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="h-6 w-6 rounded object-cover"
                    />
                  )}
                  <span>{company.name}</span>
                  {selectedCompany.id === company.id && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                    <div className="flex items-start justify-between w-full">
                      <p className="text-sm text-gray-800 pr-2">{notification.message}</p>
                      <Badge
                        variant={
                          notification.type === 'warning' ? 'destructive' :
                          notification.type === 'info' ? 'default' : 'secondary'
                        }
                        className="text-xs"
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;