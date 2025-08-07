// Context to share data between Inventory and Invoices
import React, { createContext, useContext, useState } from 'react';
import { mockProducts } from '../utils/mockData';

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState(mockProducts);

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setProducts([...products, newProduct]);
    return newProduct;
  };

  const addProducts = (newProducts) => {
    const productsWithIds = newProducts.map(product => ({
      ...product,
      id: product.id || Date.now().toString() + Math.random(),
      lastUpdated: new Date().toISOString().split('T')[0]
    }));
    setProducts([...products, ...productsWithIds]);
    return productsWithIds;
  };

  const updateProduct = (id, updates) => {
    setProducts(products.map(product => 
      product.id === id ? { 
        ...product, 
        ...updates, 
        lastUpdated: new Date().toISOString().split('T')[0] 
      } : product
    ));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const updateStock = (productId, stockChange) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { 
            ...product, 
            stock: product.stock + stockChange,
            lastUpdated: new Date().toISOString().split('T')[0]
          } 
        : product
    ));
  };

  return (
    <InventoryContext.Provider value={{
      products,
      setProducts,
      addProduct,
      addProducts,
      updateProduct,
      deleteProduct,
      updateStock
    }}>
      {children}
    </InventoryContext.Provider>
  );
};