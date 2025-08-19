import * as XLSX from 'xlsx';

// Excel column headers for inventory import
export const INVENTORY_HEADERS = [
  'Product Name *',
  'SKU',
  'Category',
  'Price *',
  'Stock Quantity *',
  'Unit',
  'GST Rate (%)',
  'HSN Code',
  'Supplier'
];

// Excel column headers for invoice import  
export const INVOICE_HEADERS = [
  'Product Name *',
  'SKU',
  'Category',
  'Price *',
  'Stock Quantity *',
  'Unit',
  'GST Rate (%)',
  'HSN Code',
  'Supplier'
];

// Create sample Excel template for inventory
export const downloadInventoryTemplate = () => {
  const sampleData = [
    {
      'Product Name *': 'Wireless Bluetooth Headphones',
      'SKU': 'WBH-001',
      'Category': 'Electronics',
      'Price *': 2499,
      'Stock Quantity *': 50,
      'Unit': 'piece',
      'GST Rate (%)': 18,
      'HSN Code': '85183000',
      'Supplier': 'Audio Tech Supplies'
    },
    {
      'Product Name *': 'Smart LED Bulb',
      'SKU': 'SLB-002', 
      'Category': 'Electronics',
      'Price *': 899,
      'Stock Quantity *': 100,
      'Unit': 'piece',
      'GST Rate (%)': 18,
      'HSN Code': '85395000',
      'Supplier': 'Lighting Solutions'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Template');
  XLSX.writeFile(wb, 'Inventory_Import_Template.xlsx');
};

// Create sample Excel template for invoice
export const downloadInvoiceTemplate = () => {
  const sampleData = [
    {
      'Product Name *': 'Wireless Bluetooth Headphones',
      'SKU': 'WBH-001',
      'Category': 'Electronics',
      'Price *': 2499,
      'Stock Quantity *': 10,
      'Unit': 'piece',
      'GST Rate (%)': 18,
      'HSN Code': '85183000',
      'Supplier': 'Audio Tech Supplies'
    },
    {
      'Product Name *': 'Smart LED Bulb',
      'SKU': 'SLB-002',
      'Category': 'Electronics', 
      'Price *': 899,
      'Stock Quantity *': 20,
      'Unit': 'piece',
      'GST Rate (%)': 18,
      'HSN Code': '85395000',
      'Supplier': 'Lighting Solutions'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice Template');
  XLSX.writeFile(wb, 'Invoice_Import_Template.xlsx');
};

// Process inventory Excel file
export const processInventoryExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, // Keep original string values
          defval: '' // Default empty cells to empty string
        });
        
        console.log('Raw Excel Data:', jsonData); // Debug log
        
        // Validate and transform data
        const products = jsonData.map((row, index) => {
          // More flexible header matching with new format
          const productName = row['Product Name *'] || row['Product Name'] || row['product name'] || row['Name'] || row['name'] || '';
          const price = row['Price *'] || row['Price'] || row['price'] || row['Unit Price'] || row['unit price'] || '0';
          const stock = row['Stock Quantity *'] || row['Stock Quantity'] || row['stock quantity'] || row['Stock'] || row['stock'] || '0';
          const sku = row['SKU'] || row['sku'] || row['Code'] || row['code'] || '';
          const category = row['Category'] || row['category'] || 'General';
          const unit = row['Unit'] || row['unit'] || 'piece';
          const hsn = row['HSN Code'] || row['hsn code'] || row['HSN'] || row['hsn'] || '';
          const gstRate = row['GST Rate (%)'] || row['gst rate (%)'] || row['GST Rate'] || row['gst rate'] || row['GST'] || row['gst'] || '18';
          const supplier = row['Supplier'] || row['supplier'] || '';

          // Validate required fields
          if (!productName || !price || !stock) {
            throw new Error(`Row ${index + 2}: Product Name, Price, and Stock Quantity are required. Found: Name="${productName}", Price="${price}", Stock="${stock}"`);
          }

          // Parse numeric values with better error handling
          const parsedPrice = parseFloat(price.toString().replace(/[^0-9.-]/g, ''));
          const parsedStock = parseInt(stock.toString().replace(/[^0-9]/g, ''));
          const parsedGstRate = parseInt(gstRate.toString().replace(/[^0-9]/g, '')) || 18;

          if (isNaN(parsedPrice) || isNaN(parsedStock)) {
            throw new Error(`Row ${index + 2}: Invalid numeric values. Price="${price}" (parsed: ${parsedPrice}), Stock="${stock}" (parsed: ${parsedStock})`);
          }

          return {
            id: Date.now() + Math.random(), // Generate unique ID
            name: productName.trim(),
            sku: sku.trim() || `SKU-${Date.now()}-${index}`,
            category: category.trim() || 'General',
            price: parsedPrice,
            stock: parsedStock,
            minStock: 5, // Default minimum stock
            unit: unit.trim() || 'piece',
            hsn: hsn.trim() || '',
            gstRate: parsedGstRate,
            supplier: supplier.trim() || '',
            lastUpdated: new Date().toISOString().split('T')[0],
            selected: true // Default selected for import
          };
        });

        console.log('Processed Products:', products); // Debug log
        resolve(products);
      } catch (error) {
        console.error('Excel processing error:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

// Process invoice Excel file
export const processInvoiceExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, // Keep original string values
          defval: '' // Default empty cells to empty string
        });
        
        console.log('Raw Invoice Excel Data:', jsonData); // Debug log
        
        // Process products for inventory (simplified format)
        const products = jsonData.map((row, index) => {
          // More flexible header matching with new format
          const productName = row['Product Name *'] || row['Product Name'] || row['product name'] || row['Name'] || row['name'] || '';
          const price = row['Price *'] || row['Price'] || row['price'] || row['Unit Price'] || row['unit price'] || '0';
          const stock = row['Stock Quantity *'] || row['Stock Quantity'] || row['stock quantity'] || row['Stock'] || row['stock'] || '0';
          const sku = row['SKU'] || row['sku'] || row['Code'] || row['code'] || '';
          const category = row['Category'] || row['category'] || 'General';
          const unit = row['Unit'] || row['unit'] || 'piece';
          const hsn = row['HSN Code'] || row['hsn code'] || row['HSN'] || row['hsn'] || '';
          const gstRate = row['GST Rate (%)'] || row['gst rate (%)'] || row['GST Rate'] || row['gst rate'] || row['GST'] || row['gst'] || '18';
          const supplier = row['Supplier'] || row['supplier'] || '';

          // Validate required fields
          if (!productName || !price || !stock) {
            throw new Error(`Row ${index + 2}: Product Name, Price, and Stock Quantity are required. Found: Name="${productName}", Price="${price}", Stock="${stock}"`);
          }

          // Parse numeric values with better error handling
          const parsedPrice = parseFloat(price.toString().replace(/[^0-9.-]/g, ''));
          const parsedStock = parseInt(stock.toString().replace(/[^0-9]/g, ''));
          const parsedGstRate = parseInt(gstRate.toString().replace(/[^0-9]/g, '')) || 18;

          if (isNaN(parsedPrice) || isNaN(parsedStock)) {
            throw new Error(`Row ${index + 2}: Invalid numeric values. Price="${price}" (parsed: ${parsedPrice}), Stock="${stock}" (parsed: ${parsedStock})`);
          }

          return {
            id: Date.now() + Math.random() + index, // Generate unique ID
            name: productName.trim(),
            sku: sku.trim() || `SKU-${Date.now()}-${index}`,
            category: category.trim() || 'General',
            price: parsedPrice,
            stock: parsedStock,
            minStock: 5, // Default minimum stock
            unit: unit.trim() || 'piece',
            hsn: hsn.trim() || '',
            gstRate: parsedGstRate,
            supplier: supplier.trim() || '',
            lastUpdated: new Date().toISOString().split('T')[0],
            selected: true // Default selected for import
          };
        });

        console.log('Processed Invoice Products:', products); // Debug log
        
        resolve(products);
      } catch (error) {
        console.error('Invoice Excel processing error:', error);
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

// Export data to Excel
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
};