import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle,
  Package,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
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
import { Label } from './ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { mockProducts } from '../utils/mockData';
import { useToast } from '../hooks/use-toast';
import { 
  downloadInventoryTemplate, 
  processInventoryExcel,
  exportToExcel 
} from '../utils/excelUtils';

const Inventory = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
    unit: 'piece',
    hsn: '',
    gstRate: '18',
    supplier: ''
  });
  
  const { toast } = useToast();

  const handleCreateProduct = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newProduct = {
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock) || 5,
      gstRate: parseInt(formData.gstRate),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setProducts([...products, newProduct]);
    setFormData({
      name: '',
      sku: '',
      category: '',
      price: '',
      stock: '',
      minStock: '',
      unit: 'piece',
      hsn: '',
      gstRate: '18',
      supplier: ''
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product added successfully",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    } else if (product.stock <= product.minStock) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
    }
  };

  const categories = [...new Set(products.map(p => p.category))];
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Enter SKU"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Enter category"
                  />
                </div>
                
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Enter stock quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    placeholder="Enter minimum stock level"
                  />
                </div>
                
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="gstRate">GST Rate (%)</Label>
                  <Select value={formData.gstRate} onValueChange={(value) => setFormData({ ...formData, gstRate: value })}>
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
                
                <div>
                  <Label htmlFor="hsn">HSN Code</Label>
                  <Input
                    id="hsn"
                    value={formData.hsn}
                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                    placeholder="Enter HSN code"
                  />
                </div>
                
                <div>
                  <Label htmlFor="supplier">Supplier</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Enter supplier name"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
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
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.supplier}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium">{product.stock}</span>
                        <span className="text-gray-500"> {product.unit}</span>
                        {product.stock <= product.minStock && (
                          <div className="text-xs text-red-600 mt-1">
                            Min: {product.minStock}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                    </TableCell>
                    <TableCell>{product.gstRate}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;