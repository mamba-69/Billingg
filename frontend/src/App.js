import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

// Import components
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Dashboard from "./components/Dashboard";
import Invoices from "./components/Invoices";
import Customers from "./components/Customers";
import Inventory from "./components/Inventory";
import Reports from "./components/Reports";
import Companies from "./components/Companies";
import Settings from "./components/Settings";

// Mock context for company selection
import { CompanyProvider } from "./context/CompanyContext";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <CompanyProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>
          <Toaster />
        </div>
      </Router>
    </CompanyProvider>
  );
}

export default App;