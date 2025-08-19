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
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

const ImportConfirmationDialog = ({ 
  open, 
  onOpenChange, 
  items, 
  onConfirm, 
  title = "Confirm Import",
  isImporting = false 
}) => {
  const [editableItems, setEditableItems] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (items) {
      setEditableItems(items.map(item => ({ ...item })));
      setErrors({});
    }
  }, [items]);

  const handleItemChange = (index, field, value) => {
    const updated = [...editableItems];
    updated[index][field] = value;
    setEditableItems(updated);

    // Clear error for this field
    const itemErrors = { ...errors };
    if (itemErrors[index]) {
      delete itemErrors[index][field];
      if (Object.keys(itemErrors[index]).length === 0) {
        delete itemErrors[index];
      }
    }
    setErrors(itemErrors);
  };

  const handleSelectChange = (index, selected) => {
    const updated = [...editableItems];
    updated[index].selected = selected;
    setEditableItems(updated);
  };

  const handleSelectAll = (checked) => {
    const updated = editableItems.map(item => ({ ...item, selected: checked }));
    setEditableItems(updated);
  };

  const validateItems = () => {
    const newErrors = {};
    editableItems.forEach((item, index) => {
      const itemErrors = {};
      
      if (!item.name || item.name.trim() === '') {
        itemErrors.name = 'Product name is required';
      }
      
      if (!item.price || isNaN(parseFloat(item.price)) || parseFloat(item.price) <= 0) {
        itemErrors.price = 'Valid price is required';
      }
      
      if (!item.stock || isNaN(parseInt(item.stock)) || parseInt(item.stock) < 0) {
        itemErrors.stock = 'Valid stock quantity is required';
      }

      if (!item.gstRate || isNaN(parseInt(item.gstRate)) || parseInt(item.gstRate) < 0) {
        itemErrors.gstRate = 'Valid GST rate is required';
      }

      if (Object.keys(itemErrors).length > 0) {
        newErrors[index] = itemErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!validateItems()) {
      return;
    }

    const selectedItems = editableItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      setErrors({ general: 'Please select at least one item to import' });
      return;
    }

    // Convert string values to appropriate types
    const processedItems = selectedItems.map(item => ({
      ...item,
      price: parseFloat(item.price),
      stock: parseInt(item.stock),
      gstRate: parseInt(item.gstRate),
      minStock: parseInt(item.minStock) || 5
    }));

    onConfirm(processedItems);
  };

  const selectedCount = editableItems.filter(item => item.selected).length;
  const totalCount = editableItems.length;
  const allSelected = selectedCount === totalCount && totalCount > 0;
  const someSelected = selectedCount > 0 && selectedCount < totalCount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Review and confirm the items to be imported. You can edit individual items and select which ones to import.
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              Total Items: {totalCount}
            </Badge>
            <Badge variant="default" className="text-sm">
              Selected: {selectedCount}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onCheckedChange={handleSelectAll}
              id="select-all"
            />
            <Label htmlFor="select-all" className="text-sm font-medium">
              Select All
            </Label>
          </div>
        </div>

        {/* Error Messages */}
        {errors.general && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertTriangle className="h-4 w-4" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Items Table */}
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
              {editableItems.map((item, index) => (
                <TableRow key={item.id || index} className={!item.selected ? 'opacity-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={(checked) => handleSelectChange(index, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className={errors[index]?.name ? 'border-red-500' : ''}
                      placeholder="Product name"
                    />
                    {errors[index]?.name && (
                      <span className="text-xs text-red-500">{errors[index].name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.sku}
                      onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                      placeholder="SKU"
                      className="min-w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.category}
                      onChange={(e) => handleItemChange(index, 'category', e.target.value)}
                      placeholder="Category"
                      className="min-w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      className={errors[index]?.price ? 'border-red-500' : ''}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors[index]?.price && (
                      <span className="text-xs text-red-500">{errors[index].price}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.stock}
                      onChange={(e) => handleItemChange(index, 'stock', e.target.value)}
                      className={errors[index]?.stock ? 'border-red-500' : ''}
                      placeholder="0"
                      min="0"
                    />
                    {errors[index]?.stock && (
                      <span className="text-xs text-red-500">{errors[index].stock}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      placeholder="piece"
                      className="min-w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.gstRate}
                      onChange={(e) => handleItemChange(index, 'gstRate', e.target.value)}
                      className={errors[index]?.gstRate ? 'border-red-500' : ''}
                      placeholder="18"
                      min="0"
                      max="100"
                    />
                    {errors[index]?.gstRate && (
                      <span className="text-xs text-red-500">{errors[index].gstRate}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.hsn}
                      onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                      placeholder="HSN Code"
                      className="min-w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={item.supplier}
                      onChange={(e) => handleItemChange(index, 'supplier', e.target.value)}
                      placeholder="Supplier"
                      className="min-w-28"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

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
            disabled={isImporting || selectedCount === 0}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isImporting ? 'Importing...' : `Import ${selectedCount} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportConfirmationDialog;