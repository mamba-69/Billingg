import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { AlertTriangle, CheckCircle2, X, FileSpreadsheet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const InvoiceImportConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  invoicesData, 
  onConfirm, 
  title = "Confirm Invoice Import",
  isImporting = false 
}) => {
  const [editableInvoices, setEditableInvoices] = useState([]);
  const [editableProducts, setEditableProducts] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoicesData) {
      setEditableInvoices(invoicesData.invoices.map(invoice => ({ ...invoice })));
      setEditableProducts(invoicesData.products.map(product => ({ ...product })));
      setErrors({});
    }
  }, [invoicesData]);

  const handleInvoiceChange = (index, field, value) => {
    const updated = [...editableInvoices];
    updated[index][field] = value;
    setEditableInvoices(updated);

    // Clear error for this field
    const itemErrors = { ...errors };
    if (itemErrors[`invoice_${index}`]) {
      delete itemErrors[`invoice_${index}`][field];
      if (Object.keys(itemErrors[`invoice_${index}`]).length === 0) {
        delete itemErrors[`invoice_${index}`];
      }
    }
    setErrors(itemErrors);
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...editableProducts];
    updated[index][field] = value;
    setEditableProducts(updated);

    // Clear error for this field
    const itemErrors = { ...errors };
    if (itemErrors[`product_${index}`]) {
      delete itemErrors[`product_${index}`][field];
      if (Object.keys(itemErrors[`product_${index}`]).length === 0) {
        delete itemErrors[`product_${index}`];
      }
    }
    setErrors(itemErrors);
  };

  const handleInvoiceSelectChange = (index, selected) => {
    const updated = [...editableInvoices];
    updated[index].selected = selected;
    setEditableInvoices(updated);
  };

  const handleProductSelectChange = (index, selected) => {
    const updated = [...editableProducts];
    updated[index].selected = selected;
    setEditableProducts(updated);
  };

  const handleSelectAllInvoices = (checked) => {
    const updated = editableInvoices.map(invoice => ({ ...invoice, selected: checked }));
    setEditableInvoices(updated);
  };

  const handleSelectAllProducts = (checked) => {
    const updated = editableProducts.map(product => ({ ...product, selected: checked }));
    setEditableProducts(updated);
  };

  const validateData = () => {
    const newErrors = {};
    
    // Validate invoices
    editableInvoices.forEach((invoice, index) => {
      const invoiceErrors = {};
      
      if (!invoice.invoiceNumber || invoice.invoiceNumber.trim() === '') {
        invoiceErrors.invoiceNumber = 'Invoice number is required';
      }
      
      if (!invoice.customerName || invoice.customerName.trim() === '') {
        invoiceErrors.customerName = 'Customer name is required';
      }
      
      if (!invoice.date || invoice.date.trim() === '') {
        invoiceErrors.date = 'Invoice date is required';
      }

      if (Object.keys(invoiceErrors).length > 0) {
        newErrors[`invoice_${index}`] = invoiceErrors;
      }
    });

    // Validate products
    editableProducts.forEach((product, index) => {
      const productErrors = {};
      
      if (!product.name || product.name.trim() === '') {
        productErrors.name = 'Product name is required';
      }
      
      if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
        productErrors.price = 'Valid price is required';
      }
      
      if (!product.stock || isNaN(parseInt(product.stock)) || parseInt(product.stock) < 0) {
        productErrors.stock = 'Valid stock quantity is required';
      }

      if (Object.keys(productErrors).length > 0) {
        newErrors[`product_${index}`] = productErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateData()) {
      return;
    }

    const selectedInvoices = editableInvoices.filter(invoice => invoice.selected);
    const selectedProducts = editableProducts.filter(product => product.selected);
    
    if (selectedInvoices.length === 0 && selectedProducts.length === 0) {
      setErrors({ general: 'Please select at least one invoice or product to import' });
      return;
    }

    // Convert string values to appropriate types
    const processedInvoices = selectedInvoices.map(invoice => ({
      ...invoice,
      items: invoice.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        gstRate: parseInt(item.gstRate),
        amount: parseInt(item.quantity) * parseFloat(item.price)
      }))
    }));

    const processedProducts = selectedProducts.map(product => ({
      ...product,
      price: parseFloat(product.price),
      stock: parseInt(product.stock),
      gstRate: parseInt(product.gstRate),
      minStock: parseInt(product.minStock) || 5
    }));

    onConfirm({ invoices: processedInvoices, products: processedProducts });
  };

  const selectedInvoicesCount = editableInvoices.filter(invoice => invoice.selected).length;
  const totalInvoicesCount = editableInvoices.length;
  const selectedProductsCount = editableProducts.filter(product => product.selected).length;
  const totalProductsCount = editableProducts.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-blue-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Review and confirm the invoices and products to be imported. Invoices will be created and products will be added to inventory.
          </DialogDescription>
        </DialogHeader>

        {/* Error Messages */}
        {errors.general && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              Invoices ({selectedInvoicesCount}/{totalInvoicesCount})
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              Products ({selectedProductsCount}/{totalProductsCount})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="invoices" className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Total Invoices: {totalInvoicesCount}
                </Badge>
                <Badge variant="default" className="text-sm">
                  Selected: {selectedInvoicesCount}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedInvoicesCount === totalInvoicesCount && totalInvoicesCount > 0}
                  onCheckedChange={handleSelectAllInvoices}
                  id="select-all-invoices"
                />
                <Label htmlFor="select-all-invoices" className="text-sm font-medium">
                  Select All
                </Label>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead className="min-w-32">Invoice Number *</TableHead>
                    <TableHead className="min-w-48">Customer Name *</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="min-w-32">Invoice Date *</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Items Count</TableHead>
                    <TableHead>Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableInvoices.map((invoice, index) => (
                    <TableRow key={invoice.id || index} className={!invoice.selected ? 'opacity-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={invoice.selected}
                          onCheckedChange={(checked) => handleInvoiceSelectChange(index, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={invoice.invoiceNumber}
                          onChange={(e) => handleInvoiceChange(index, 'invoiceNumber', e.target.value)}
                          className={errors[`invoice_${index}`]?.invoiceNumber ? 'border-red-500' : ''}
                          placeholder="INV-001"
                        />
                        {errors[`invoice_${index}`]?.invoiceNumber && (
                          <span className="text-xs text-red-500">{errors[`invoice_${index}`].invoiceNumber}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={invoice.customerName}
                          onChange={(e) => handleInvoiceChange(index, 'customerName', e.target.value)}
                          className={errors[`invoice_${index}`]?.customerName ? 'border-red-500' : ''}
                          placeholder="Customer name"
                        />
                        {errors[`invoice_${index}`]?.customerName && (
                          <span className="text-xs text-red-500">{errors[`invoice_${index}`].customerName}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="email"
                          value={invoice.customerEmail}
                          onChange={(e) => handleInvoiceChange(index, 'customerEmail', e.target.value)}
                          placeholder="email@example.com"
                          className="min-w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={invoice.customerPhone}
                          onChange={(e) => handleInvoiceChange(index, 'customerPhone', e.target.value)}
                          placeholder="+91 9876543210"
                          className="min-w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={invoice.date}
                          onChange={(e) => handleInvoiceChange(index, 'date', e.target.value)}
                          className={errors[`invoice_${index}`]?.date ? 'border-red-500' : ''}
                        />
                        {errors[`invoice_${index}`]?.date && (
                          <span className="text-xs text-red-500">{errors[`invoice_${index}`].date}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={invoice.dueDate}
                          onChange={(e) => handleInvoiceChange(index, 'dueDate', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{invoice.items.length}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">₹{invoice.totalAmount?.toFixed(2) || '0.00'}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="text-sm">
                  Total Products: {totalProductsCount}
                </Badge>
                <Badge variant="default" className="text-sm">
                  Selected: {selectedProductsCount}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedProductsCount === totalProductsCount && totalProductsCount > 0}
                  onCheckedChange={handleSelectAllProducts}
                  id="select-all-products"
                />
                <Label htmlFor="select-all-products" className="text-sm font-medium">
                  Select All
                </Label>
              </div>
            </div>

            {/* Products Table */}
            <div className="border rounded-lg overflow-hidden max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead className="w-12">Select</TableHead>
                    <TableHead className="min-w-48">Product Name *</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="min-w-24">Price *</TableHead>
                    <TableHead className="min-w-28">Stock Qty *</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="min-w-24">GST Rate</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead className="min-w-32">Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editableProducts.map((product, index) => (
                    <TableRow key={product.id || index} className={!product.selected ? 'opacity-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={product.selected}
                          onCheckedChange={(checked) => handleProductSelectChange(index, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.name}
                          onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                          className={errors[`product_${index}`]?.name ? 'border-red-500' : ''}
                          placeholder="Product name"
                        />
                        {errors[`product_${index}`]?.name && (
                          <span className="text-xs text-red-500">{errors[`product_${index}`].name}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.sku}
                          onChange={(e) => handleProductChange(index, 'sku', e.target.value)}
                          placeholder="SKU"
                          className="min-w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.category}
                          onChange={(e) => handleProductChange(index, 'category', e.target.value)}
                          placeholder="Category"
                          className="min-w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.price}
                          onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                          className={errors[`product_${index}`]?.price ? 'border-red-500' : ''}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                        {errors[`product_${index}`]?.price && (
                          <span className="text-xs text-red-500">{errors[`product_${index}`].price}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.stock}
                          onChange={(e) => handleProductChange(index, 'stock', e.target.value)}
                          className={errors[`product_${index}`]?.stock ? 'border-red-500' : ''}
                          placeholder="0"
                          min="0"
                        />
                        {errors[`product_${index}`]?.stock && (
                          <span className="text-xs text-red-500">{errors[`product_${index}`].stock}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.unit}
                          onChange={(e) => handleProductChange(index, 'unit', e.target.value)}
                          placeholder="piece"
                          className="min-w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={product.gstRate}
                          onChange={(e) => handleProductChange(index, 'gstRate', e.target.value)}
                          placeholder="18"
                          min="0"
                          max="100"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.hsn}
                          onChange={(e) => handleProductChange(index, 'hsn', e.target.value)}
                          placeholder="HSN Code"
                          className="min-w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={product.supplier}
                          onChange={(e) => handleProductChange(index, 'supplier', e.target.value)}
                          placeholder="Supplier"
                          className="min-w-28"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isImporting || (selectedInvoicesCount === 0 && selectedProductsCount === 0)}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isImporting ? 'Importing...' : `Import ${selectedInvoicesCount} Invoices & ${selectedProductsCount} Products`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceImportConfirmationDialog;