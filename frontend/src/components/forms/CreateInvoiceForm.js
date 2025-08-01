import React, { useState } from 'react';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { mockCustomers, mockProducts } from '../../utils/mockData';
import { useToast } from '../../hooks/use-toast';

const CreateInvoiceForm = ({ onClose }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    items: [
      {
        productId: '',
        name: '',
        quantity: 1,
        price: 0,
        gstRate: 18,
        amount: 0
      }
    ]
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          productId: '',
          name: '',
          quantity: 1,
          price: 0,
          gstRate: 18,
          amount: 0
        }
      ]
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or price changes
    if (field === 'quantity' || field === 'price') {
      newItems[index].amount = newItems[index].quantity * newItems[index].price;
    }
    
    // Auto-fill product details when product is selected
    if (field === 'productId' && value) {
      const product = mockProducts.find(p => p.id === value);
      if (product) {
        newItems[index] = {
          ...newItems[index],
          name: product.name,
          price: product.price,
          gstRate: product.gstRate,
          amount: newItems[index].quantity * product.price
        };
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const gstAmount = formData.items.reduce((sum, item) => {
      return sum + (item.amount * item.gstRate / 100);
    }, 0);
    const total = subtotal + gstAmount;
    
    return { subtotal, gstAmount, total };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.dueDate) {
      toast({
        title: "Error",
        description: "Please select a due date",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.items.some(item => !item.name || item.quantity <= 0 || item.price <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all item details",
        variant: "destructive",
      });
      return;
    }
    
    // Mock invoice creation
    const totals = calculateTotals();
    const customer = mockCustomers.find(c => c.id === formData.customerId);
    
    const newInvoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: `TCS/2024/${String(Date.now()).slice(-3)}`,
      customerId: formData.customerId,
      customerName: customer?.name || '',
      date: formData.date,
      dueDate: formData.dueDate,
      amount: totals.subtotal,
      gstAmount: totals.gstAmount,
      totalAmount: totals.total,
      status: 'draft',
      items: formData.items,
      notes: formData.notes
    };
    
    console.log('Created invoice:', newInvoice);
    
    toast({
      title: "Success",
      description: "Invoice created successfully",
    });
    
    onClose();
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Invoice Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer">Customer *</Label>
          <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {mockCustomers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="date">Invoice Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Invoice Items
            <Button type="button" onClick={addItem} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                <div className="md:col-span-2">
                  <Label>Product</Label>
                  <Select 
                    value={item.productId} 
                    onValueChange={(value) => updateItem(index, 'productId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!item.productId && (
                    <Input
                      placeholder="Custom item name"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div>
                  <Label>GST %</Label>
                  <Select 
                    value={item.gstRate.toString()} 
                    onValueChange={(value) => updateItem(index, 'gstRate', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0%</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="12">12%</SelectItem>
                      <SelectItem value="18">18%</SelectItem>
                      <SelectItem value="28">28%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <Label>Amount</Label>
                    <div className="text-lg font-semibold">{formatCurrency(item.amount)}</div>
                  </div>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST Amount:</span>
              <span className="font-semibold">{formatCurrency(gstAmount)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          placeholder="Add any additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Create Invoice
        </Button>
      </div>
    </form>
  );
};

export default CreateInvoiceForm;