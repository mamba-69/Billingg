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
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false, // Keep original string values
          defval: '' // Default empty cells to empty string
        });
        
        console.log('Raw Excel Data:', jsonData); // Debug log
        
        // Validate and transform data
        const products = jsonData.map((row, index) => {
          // More flexible header matching
          const productName = row['Product Name'] || row['product name'] || row['Name'] || row['name'] || '';
          const price = row['Price'] || row['price'] || row['Unit Price'] || row['unit price'] || '0';
          const stock = row['Stock Quantity'] || row['stock quantity'] || row['Stock'] || row['stock'] || '0';
          const sku = row['SKU'] || row['sku'] || row['Code'] || row['code'] || '';
          const category = row['Category'] || row['category'] || 'General';
          const minStock = row['Minimum Stock'] || row['minimum stock'] || row['Min Stock'] || row['min stock'] || '5';
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
          const parsedMinStock = parseInt(minStock.toString().replace(/[^0-9]/g, '')) || 5;
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
            minStock: parsedMinStock,
            unit: unit.trim() || 'piece',
            hsn: hsn.trim() || '',
            gstRate: parsedGstRate,
            supplier: supplier.trim() || '',
            lastUpdated: new Date().toISOString().split('T')[0]
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
        
        // Group by invoice number
        const invoicesMap = {};
        const productsMap = {}; // Track products to add to inventory
        
        jsonData.forEach((row, index) => {
          // More flexible header matching for invoices
          const invoiceNumber = row['Invoice Number'] || row['invoice number'] || row['Invoice'] || row['invoice'] || '';
          const customerName = row['Customer Name'] || row['customer name'] || row['Customer'] || row['customer'] || '';
          const productName = row['Product Name'] || row['product name'] || row['Product'] || row['product'] || '';
          const customerEmail = row['Customer Email'] || row['customer email'] || row['Email'] || row['email'] || '';
          const customerPhone = row['Customer Phone'] || row['customer phone'] || row['Phone'] || row['phone'] || '';
          const customerAddress = row['Customer Address'] || row['customer address'] || row['Address'] || row['address'] || '';
          const customerGSTIN = row['Customer GSTIN'] || row['customer gstin'] || row['GSTIN'] || row['gstin'] || '';
          const invoiceDate = row['Invoice Date'] || row['invoice date'] || row['Date'] || row['date'] || '';
          const dueDate = row['Due Date'] || row['due date'] || row['DueDate'] || row['duedate'] || '';
          const sku = row['SKU'] || row['sku'] || row['Code'] || row['code'] || '';
          const category = row['Category'] || row['category'] || 'General';
          const quantity = row['Quantity'] || row['quantity'] || row['Qty'] || row['qty'] || '1';
          const unitPrice = row['Unit Price'] || row['unit price'] || row['Price'] || row['price'] || '0';
          const unit = row['Unit'] || row['unit'] || 'piece';
          const hsn = row['HSN Code'] || row['hsn code'] || row['HSN'] || row['hsn'] || '';
          const gstRate = row['GST Rate (%)'] || row['gst rate (%)'] || row['GST Rate'] || row['gst rate'] || row['GST'] || row['gst'] || '18';
          const notes = row['Notes'] || row['notes'] || row['Note'] || row['note'] || '';

          // Validate required fields
          if (!invoiceNumber || !customerName || !productName) {
            throw new Error(`Row ${index + 2}: Invoice Number, Customer Name, and Product Name are required. Found: Invoice="${invoiceNumber}", Customer="${customerName}", Product="${productName}"`);
          }

          // Parse numeric values with better error handling
          const parsedQuantity = parseInt(quantity.toString().replace(/[^0-9]/g, '')) || 1;
          const parsedPrice = parseFloat(unitPrice.toString().replace(/[^0-9.-]/g, '')) || 0;
          const parsedGstRate = parseInt(gstRate.toString().replace(/[^0-9]/g, '')) || 18;

          if (isNaN(parsedQuantity) || isNaN(parsedPrice)) {
            throw new Error(`Row ${index + 2}: Invalid numeric values. Quantity="${quantity}" (parsed: ${parsedQuantity}), Price="${unitPrice}" (parsed: ${parsedPrice})`);
          }

          // Create or update invoice
          if (!invoicesMap[invoiceNumber]) {
            invoicesMap[invoiceNumber] = {
              id: `INV-${Date.now()}-${Math.random()}`,
              invoiceNumber: invoiceNumber.trim(),
              customerId: `CUST-${Date.now()}-${Math.random()}`, 
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim() || '',
              customerPhone: customerPhone.trim() || '',
              customerAddress: customerAddress.trim() || '',
              customerGSTIN: customerGSTIN.trim() || '',
              date: invoiceDate.trim() || new Date().toISOString().split('T')[0],
              dueDate: dueDate.trim() || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
              items: [],
              notes: notes.trim() || '',
              status: 'draft'
            };
          }

          // Add item to invoice
          const item = {
            productId: sku.trim() || `PROD-${Date.now()}-${index}`,
            name: productName.trim(),
            sku: sku.trim() || `SKU-${Date.now()}-${index}`,
            category: category.trim() || 'General',
            quantity: parsedQuantity,
            price: parsedPrice,
            unit: unit.trim() || 'piece',
            hsn: hsn.trim() || '',
            gstRate: parsedGstRate,
            amount: parsedQuantity * parsedPrice
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

        console.log('Processed Invoices:', invoices); // Debug log
        console.log('Processed Products from Invoice:', products); // Debug log
        
        resolve({ invoices, products });
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