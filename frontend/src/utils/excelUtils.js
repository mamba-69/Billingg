import * as XLSX from 'xlsx';

// Excel column headers for inventory import
export const INVENTORY_HEADERS = [
  'Product Name',
  'SKU',
  'Category', 
  'Price',
  'Stock Quantity',
  'Minimum Stock',
  'Unit',
  'HSN Code',
  'GST Rate (%)',
  'Supplier'
];

// Excel column headers for invoice import
export const INVOICE_HEADERS = [
  'Invoice Number',
  'Customer Name',
  'Customer Email',
  'Customer Phone',
  'Customer Address',
  'Customer GSTIN',
  'Invoice Date',
  'Due Date',
  'Product Name',
  'SKU',
  'Category',
  'Quantity',
  'Unit Price',
  'Unit',
  'HSN Code',
  'GST Rate (%)',
  'Notes'
];

// Create sample Excel template for inventory
export const downloadInventoryTemplate = () => {
  const sampleData = [
    {
      'Product Name': 'Wireless Bluetooth Headphones',
      'SKU': 'WBH-001',
      'Category': 'Electronics',
      'Price': 2499,
      'Stock Quantity': 50,
      'Minimum Stock': 10,
      'Unit': 'piece',
      'HSN Code': '85183000',
      'GST Rate (%)': 18,
      'Supplier': 'Audio Tech Supplies'
    },
    {
      'Product Name': 'Smart LED Bulb',
      'SKU': 'SLB-002', 
      'Category': 'Electronics',
      'Price': 899,
      'Stock Quantity': 100,
      'Minimum Stock': 20,
      'Unit': 'piece',
      'HSN Code': '85395000',
      'GST Rate (%)': 18,
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
      'Invoice Number': 'INV-001',
      'Customer Name': 'Acme Corporation',
      'Customer Email': 'billing@acme.com',
      'Customer Phone': '+91 9876543210',
      'Customer Address': '789 Industrial Area, Delhi 110001',
      'Customer GSTIN': '07AAPFU0939F1ZV',
      'Invoice Date': '2024-07-20',
      'Due Date': '2024-08-19',
      'Product Name': 'Wireless Bluetooth Headphones',
      'SKU': 'WBH-001',
      'Category': 'Electronics',
      'Quantity': 10,
      'Unit Price': 2499,
      'Unit': 'piece',
      'HSN Code': '85183000',
      'GST Rate (%)': 18,
      'Notes': 'Payment due in 30 days'
    },
    {
      'Invoice Number': 'INV-001',
      'Customer Name': 'Acme Corporation', 
      'Customer Email': 'billing@acme.com',
      'Customer Phone': '+91 9876543210',
      'Customer Address': '789 Industrial Area, Delhi 110001',
      'Customer GSTIN': '07AAPFU0939F1ZV',
      'Invoice Date': '2024-07-20',
      'Due Date': '2024-08-19',
      'Product Name': 'Smart LED Bulb',
      'SKU': 'SLB-002',
      'Category': 'Electronics', 
      'Quantity': 20,
      'Unit Price': 899,
      'Unit': 'piece',
      'HSN Code': '85395000',
      'GST Rate (%)': 18,
      'Notes': 'Payment due in 30 days'
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const products = jsonData.map((row, index) => {
          // Validate required fields
          if (!row['Product Name'] || !row['Price'] || !row['Stock Quantity']) {
            throw new Error(`Row ${index + 2}: Product Name, Price, and Stock Quantity are required`);
          }

          return {
            id: Date.now() + Math.random(), // Generate unique ID
            name: row['Product Name'],
            sku: row['SKU'] || `SKU-${Date.now()}-${index}`,
            category: row['Category'] || 'General',
            price: parseFloat(row['Price']) || 0,
            stock: parseInt(row['Stock Quantity']) || 0,
            minStock: parseInt(row['Minimum Stock']) || 5,
            unit: row['Unit'] || 'piece',
            hsn: row['HSN Code'] || '',
            gstRate: parseInt(row['GST Rate (%)']) || 18,
            supplier: row['Supplier'] || '',
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        });

        resolve(products);
      } catch (error) {
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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Group by invoice number
        const invoicesMap = {};
        const productsMap = {}; // Track products to add to inventory
        
        jsonData.forEach((row, index) => {
          // Validate required fields
          if (!row['Invoice Number'] || !row['Customer Name'] || !row['Product Name']) {
            throw new Error(`Row ${index + 2}: Invoice Number, Customer Name, and Product Name are required`);
          }

          const invoiceNumber = row['Invoice Number'];
          
          // Create or update invoice
          if (!invoicesMap[invoiceNumber]) {
            invoicesMap[invoiceNumber] = {
              id: `INV-${Date.now()}-${Math.random()}`,
              invoiceNumber: invoiceNumber,
              customerId: `CUST-${Date.now()}-${Math.random()}`, 
              customerName: row['Customer Name'],
              customerEmail: row['Customer Email'] || '',
              customerPhone: row['Customer Phone'] || '',
              customerAddress: row['Customer Address'] || '',
              customerGSTIN: row['Customer GSTIN'] || '',
              date: row['Invoice Date'] || new Date().toISOString().split('T')[0],
              dueDate: row['Due Date'] || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              items: [],
              notes: row['Notes'] || '',
              status: 'draft'
            };
          }

          // Add item to invoice
          const item = {
            productId: row['SKU'] || `PROD-${Date.now()}-${index}`,
            name: row['Product Name'],
            sku: row['SKU'] || `SKU-${Date.now()}-${index}`,
            category: row['Category'] || 'General',
            quantity: parseInt(row['Quantity']) || 1,
            price: parseFloat(row['Unit Price']) || 0,
            unit: row['Unit'] || 'piece',
            hsn: row['HSN Code'] || '',
            gstRate: parseInt(row['GST Rate (%)']) || 18,
            amount: (parseInt(row['Quantity']) || 1) * (parseFloat(row['Unit Price']) || 0)
          };

          invoicesMap[invoiceNumber].items.push(item);

          // Add/update product in inventory
          if (!productsMap[item.sku]) {
            productsMap[item.sku] = {
              id: item.productId,
              name: item.name,
              sku: item.sku,
              category: item.category,
              price: item.price,
              stock: 0, // Will be updated when items are "received"
              minStock: 5,
              unit: item.unit,
              hsn: item.hsn,
              gstRate: item.gstRate,
              supplier: 'Imported',
              lastUpdated: new Date().toISOString().split('T')[0]
            };
          }
          
          // Add quantity to stock (assuming items are being received)
          productsMap[item.sku].stock += item.quantity;
        });

        // Calculate totals for each invoice
        const invoices = Object.values(invoicesMap).map(invoice => {
          const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
          const gstAmount = invoice.items.reduce((sum, item) => {
            return sum + (item.amount * item.gstRate / 100);
          }, 0);
          
          return {
            ...invoice,
            amount: subtotal,
            gstAmount: gstAmount,
            totalAmount: subtotal + gstAmount
          };
        });

        const products = Object.values(productsMap);

        resolve({ invoices, products });
      } catch (error) {
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