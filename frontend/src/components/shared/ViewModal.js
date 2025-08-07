import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const ViewModal = ({ isOpen, onClose, item, type }) => {
  if (!item) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const renderInvoiceView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
          <p className="text-lg font-semibold">{item.invoiceNumber}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <Badge 
            className={
              item.status === 'paid' ? 'bg-green-100 text-green-800' :
              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }
          >
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer</h3>
          <p className="text-lg">{item.customerName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Date</h3>
          <p className="text-lg">{formatDate(item.date)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
          <p className="text-lg">{formatDate(item.dueDate)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(item.totalAmount)}</p>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
        {item.items?.map((invoiceItem, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
            <div>
              <p className="font-medium">{invoiceItem.name}</p>
              <p className="text-sm text-gray-500">Qty: {invoiceItem.quantity} | Rate: {formatCurrency(invoiceItem.price)}</p>
            </div>
            <p className="font-semibold">{formatCurrency(invoiceItem.amount)}</p>
          </div>
        ))}
      </div>
      
      {item.notes && (
        <>
          <Separator />
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="text-gray-800 mt-1">{item.notes}</p>
          </div>
        </>
      )}
    </div>
  );

  const renderCustomerView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Name</h3>
          <p className="text-lg font-semibold">{item.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Email</h3>
          <p className="text-lg">{item.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Phone</h3>
          <p className="text-lg">{item.phone}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">GSTIN</h3>
          <p className="text-lg font-mono">{item.gstin || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Outstanding</h3>
          <p className={`text-lg font-semibold ${item.outstanding > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(item.outstanding)}
          </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-500">Address</h3>
        <p className="text-gray-800 mt-1">{item.address}</p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Total Business</h3>
          <p className="text-lg font-semibold text-blue-600">{formatCurrency(item.totalBusiness)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Invoice</h3>
          <p className="text-lg">{formatDate(item.lastInvoice)}</p>
        </div>
      </div>
    </div>
  );

  const renderProductView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Product Name</h3>
          <p className="text-lg font-semibold">{item.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">SKU</h3>
          <p className="text-lg font-mono">{item.sku}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <Badge variant="outline">{item.category}</Badge>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Price</h3>
          <p className="text-lg font-semibold">{formatCurrency(item.price)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Current Stock</h3>
          <p className={`text-lg font-semibold ${
            item.stock === 0 ? 'text-red-600' : 
            item.stock <= item.minStock ? 'text-yellow-600' : 
            'text-green-600'
          }`}>
            {item.stock} {item.unit}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Minimum Stock</h3>
          <p className="text-lg">{item.minStock} {item.unit}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">GST Rate</h3>
          <p className="text-lg">{item.gstRate}%</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">HSN Code</h3>
          <p className="text-lg font-mono">{item.hsn || 'N/A'}</p>
        </div>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
          <p className="text-lg">{item.supplier || 'N/A'}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
          <p className="text-lg">{formatDate(item.lastUpdated)}</p>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Stock Value</h3>
        <p className="text-2xl font-bold text-blue-900">{formatCurrency(item.price * item.stock)}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {type === 'invoice' && `Invoice Details - ${item.invoiceNumber}`}
            {type === 'customer' && `Customer Details - ${item.name}`}
            {type === 'product' && `Product Details - ${item.name}`}
          </DialogTitle>
        </DialogHeader>
        
        {type === 'invoice' && renderInvoiceView()}
        {type === 'customer' && renderCustomerView()}
        {type === 'product' && renderProductView()}
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;