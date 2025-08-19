import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  FileSpreadsheet,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import CreateInvoiceForm from './forms/CreateInvoiceForm';
import { 
  downloadInvoiceTemplate, 
  processInvoiceExcel,
  exportToExcel 
} from '../utils/excelUtils';
import { useToast } from '../hooks/use-toast';
import apiService from '../services/api';
import ImportConfirmationDialog from './ImportConfirmationDialog';

const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Import confirmation dialog state
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [pendingImportItems, setPendingImportItems] = useState([]);

  // Load invoices on component mount
  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await apiService.getInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices from server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvoice = async (updatedData) => {
    try {
      const updatedInvoice = await apiService.updateInvoice(editingInvoice.id, updatedData);
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? updatedInvoice : inv));
      
      setIsEditDialogOpen(false);
      setEditingInvoice(null);
      
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`)) {
      try {
        await apiService.deleteInvoice(invoice.id);
        setInvoices(invoices.filter(inv => inv.id !== invoice.id));
        toast({
          title: "Success",
          description: "Invoice deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting invoice:', error);
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'default', className: 'bg-green-100 text-green-800' },
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800' },
      overdue: { variant: 'destructive', className: 'bg-red-100 text-red-800' },
      draft: { variant: 'outline', className: 'bg-gray-100 text-gray-800' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportExcel = () => {
    const exportData = invoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Customer Name': invoice.customerName,
      'Date': formatDate(invoice.date),
      'Due Date': formatDate(invoice.dueDate),
      'Amount': invoice.amount,
      'GST Amount': invoice.gstAmount,
      'Total Amount': invoice.totalAmount,
      'Status': invoice.status,
      'Notes': invoice.notes || ''
    }));

    exportToExcel(exportData, 'Invoices_Export.xlsx', 'Invoices');
    toast({
      title: "Success",
      description: "Invoices exported successfully",
    });
  };

  const handleDownloadTemplate = () => {
    downloadInvoiceTemplate();
    toast({
      title: "Template Downloaded",
      description: "Use this template to import your invoices and items will be added to inventory",
    });
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "Error",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    try {
      const importedProducts = await processInvoiceExcel(file);
      setPendingImportItems(importedProducts);
      setShowImportDialog(true);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to process Excel file",
        variant: "destructive",
      });
    } finally {
      // Reset file input
      event.target.value = '';
    }
  };

  const handleConfirmImport = async (selectedItems) => {
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      // Add imported products using API (adding to inventory from invoice)
      for (const product of selectedItems) {
        try {
          const newProduct = await apiService.createProduct({
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
            minStock: product.minStock,
            unit: product.unit,
            hsn: product.hsn,
            gstRate: product.gstRate,
            supplier: product.supplier
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to import product ${product.name}:`, error);
          errorCount++;
        }
      }
      
      toast({
        title: "Import Complete",
        description: `Successfully added ${successCount} products to inventory${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
        variant: errorCount > 0 ? "destructive" : "default"
      });

      setShowImportDialog(false);
      setPendingImportItems([]);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Error",
        description: error.message || "Failed to import products",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleDownloadTemplate} 
            className="flex items-center gap-2"
            disabled={isImporting}
          >
            <Download className="h-4 w-4" />
            Download Template
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button variant="outline" className="flex items-center gap-2" disabled={isImporting}>
              <Upload className="h-4 w-4" />
              {isImporting ? 'Importing...' : 'Import Excel'}
            </Button>
          </div>
          <Button variant="outline" onClick={handleExportExcel} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <CreateInvoiceForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Invoice</DialogTitle>
              </DialogHeader>
              <CreateInvoiceForm 
                initialData={editingInvoice} 
                onClose={() => setIsEditDialogOpen(false)}
                onSubmit={handleUpdateInvoice}
                isEdit={true}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoices.reduce((sum, inv) => sum + inv.totalAmount, 0))}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {invoices.filter(inv => inv.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {invoices.filter(inv => inv.status === 'overdue').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading invoices...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteInvoice(invoice)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invoices;