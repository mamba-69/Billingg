import React, { createContext, useContext, useState } from 'react';
import { mockCompanies } from '../utils/mockData';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [selectedCompany, setSelectedCompany] = useState(mockCompanies[0]);

  const addCompany = (company) => {
    const newCompany = {
      ...company,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setCompanies([...companies, newCompany]);
    return newCompany;
  };

  const updateCompany = (id, updates) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, ...updates } : company
    ));
    if (selectedCompany.id === id) {
      setSelectedCompany({ ...selectedCompany, ...updates });
    }
  };

  const deleteCompany = (id) => {
    if (companies.length <= 1) return false; // Don't delete last company
    setCompanies(companies.filter(company => company.id !== id));
    if (selectedCompany.id === id) {
      setSelectedCompany(companies.find(company => company.id !== id));
    }
    return true;
  };

  const switchCompany = (company) => {
    setSelectedCompany(company);
  };

  return (
    <CompanyContext.Provider value={{
      companies,
      selectedCompany,
      addCompany,
      updateCompany,
      deleteCompany,
      switchCompany
    }}>
      {children}
    </CompanyContext.Provider>
  );
};