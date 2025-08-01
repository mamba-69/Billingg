// Mock data for the billing app

export const mockCompanies = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    email: 'contact@techcorp.com',
    phone: '+91 9876543210',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
    gstin: '27AAPFU0939F1ZV',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&crop=center',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Digital Ventures',
    email: 'info@digitalventures.in',
    phone: '+91 8765432109',
    address: '456 Tech Tower, Bangalore, Karnataka 560001',
    gstin: '29BBCDE1234E5FG',
    logo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=center',
    createdAt: '2024-02-20T14:15:00Z'
  }
];

export const mockCustomers = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    phone: '+91 9876543210',
    address: '789 Industrial Area, Delhi 110001',
    gstin: '07AAPFU0939F1ZV',
    outstanding: 45000,
    totalBusiness: 125000,
    lastInvoice: '2024-07-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Global Enterprises',
    email: 'accounts@global.com',
    phone: '+91 8765432109',
    address: '321 Business District, Pune 411001',
    gstin: '27BBCDE1234E5FG',
    outstanding: 0,
    totalBusiness: 87500,
    lastInvoice: '2024-07-20',
    status: 'active'
  },
  {
    id: '3',
    name: 'Smart Solutions Ltd',
    email: 'finance@smartsol.in',
    phone: '+91 7654321098',
    address: '654 Tech Hub, Chennai 600001',
    gstin: '33CDEFG5678H9IJ',
    outstanding: 22500,
    totalBusiness: 56000,
    lastInvoice: '2024-07-18',
    status: 'active'
  }
];

export const mockProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    sku: 'WBH-001',
    category: 'Electronics',
    price: 2499,
    stock: 45,
    minStock: 10,
    unit: 'piece',
    hsn: '85183000',
    gstRate: 18,
    supplier: 'Audio Tech Supplies',
    lastUpdated: '2024-07-20'
  },
  {
    id: '2',
    name: 'Smart LED Bulb',
    sku: 'SLB-002',
    category: 'Electronics',
    price: 899,
    stock: 78,
    minStock: 20,
    unit: 'piece',
    hsn: '85395000',
    gstRate: 18,
    supplier: 'Lighting Solutions',
    lastUpdated: '2024-07-19'
  },
  {
    id: '3',
    name: 'Cotton T-Shirt',
    sku: 'CTS-003',
    category: 'Clothing',
    price: 599,
    stock: 8,
    minStock: 15,
    unit: 'piece',
    hsn: '61051000',
    gstRate: 5,
    supplier: 'Textile Hub',
    lastUpdated: '2024-07-18'
  },
  {
    id: '4',
    name: 'Office Chair',
    sku: 'OFC-004',
    category: 'Furniture',
    price: 8999,
    stock: 25,
    minStock: 5,
    unit: 'piece',
    hsn: '94013100',
    gstRate: 18,
    supplier: 'Office Furniture Co.',
    lastUpdated: '2024-07-17'
  }
];

export const mockInvoices = [
  {
    id: 'INV-001',
    invoiceNumber: 'TCS/2024/001',
    customerId: '1',
    customerName: 'Acme Corporation',
    date: '2024-07-20',
    dueDate: '2024-08-19',
    amount: 45000,
    gstAmount: 8100,
    totalAmount: 53100,
    status: 'pending',
    items: [
      {
        productId: '1',
        name: 'Wireless Bluetooth Headphones',
        quantity: 10,
        price: 2499,
        amount: 24990,
        gstRate: 18
      },
      {
        productId: '2',
        name: 'Smart LED Bulb',
        quantity: 20,
        price: 899,
        amount: 17980,
        gstRate: 18
      }
    ],
    notes: 'Payment due in 30 days'
  },
  {
    id: 'INV-002',
    invoiceNumber: 'TCS/2024/002',
    customerId: '2',
    customerName: 'Global Enterprises',
    date: '2024-07-18',
    dueDate: '2024-08-17',
    amount: 26970,
    gstAmount: 4854,
    totalAmount: 31824,
    status: 'paid',
    items: [
      {
        productId: '4',
        name: 'Office Chair',
        quantity: 3,
        price: 8999,
        amount: 26997,
        gstRate: 18
      }
    ],
    notes: 'Bulk order discount applied'
  },
  {
    id: 'INV-003',
    invoiceNumber: 'TCS/2024/003',
    customerId: '3',
    customerName: 'Smart Solutions Ltd',
    date: '2024-07-15',
    dueDate: '2024-08-14',
    amount: 21945,
    gstAmount: 3950,
    totalAmount: 25895,
    status: 'overdue',
    items: [
      {
        productId: '3',
        name: 'Cotton T-Shirt',
        quantity: 35,
        price: 599,
        amount: 20965,
        gstRate: 5
      }
    ],
    notes: 'Urgent payment required'
  }
];

export const mockDashboardStats = {
  totalRevenue: 487500,
  monthlyRevenue: 125000,
  pendingAmount: 67500,
  totalCustomers: 28,
  totalInvoices: 156,
  paidInvoices: 134,
  pendingInvoices: 18,
  overdueInvoices: 4,
  topProducts: [
    { name: 'Wireless Bluetooth Headphones', sold: 45, revenue: 112455 },
    { name: 'Smart LED Bulb', sold: 89, revenue: 80011 },
    { name: 'Office Chair', sold: 12, revenue: 107988 }
  ],
  recentActivity: [
    { type: 'invoice_created', description: 'Invoice INV-001 created for Acme Corporation', time: '2 hours ago' },
    { type: 'payment_received', description: 'Payment received from Global Enterprises', time: '4 hours ago' },
    { type: 'customer_added', description: 'New customer Smart Solutions Ltd added', time: '1 day ago' },
    { type: 'stock_alert', description: 'Cotton T-Shirt stock running low', time: '2 days ago' }
  ],
  monthlyChart: [
    { month: 'Jan', revenue: 65000, expenses: 45000 },
    { month: 'Feb', revenue: 78000, expenses: 52000 },
    { month: 'Mar', revenue: 89000, expenses: 61000 },
    { month: 'Apr', revenue: 94000, expenses: 68000 },
    { month: 'May', revenue: 112000, expenses: 78000 },
    { month: 'Jun', revenue: 125000, expenses: 85000 },
    { month: 'Jul', revenue: 135000, expenses: 92000 }
  ]
};

export const mockReports = {
  salesReport: {
    totalSales: 487500,
    totalTax: 87750,
    netProfit: 156000,
    topCustomers: [
      { name: 'Acme Corporation', amount: 125000 },
      { name: 'Global Enterprises', amount: 87500 },
      { name: 'Smart Solutions Ltd', amount: 56000 }
    ]
  },
  gstReport: {
    cgst: 43875,
    sgst: 43875,
    igst: 0,
    totalGst: 87750,
    gstPayable: 87750
  },
  inventoryReport: {
    totalValue: 892450,
    lowStockItems: 3,
    outOfStockItems: 0,
    categories: [
      { name: 'Electronics', value: 456780, percentage: 51.2 },
      { name: 'Clothing', value: 234560, percentage: 26.3 },
      { name: 'Furniture', value: 201110, percentage: 22.5 }
    ]
  }
};