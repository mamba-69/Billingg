import React, { useState } from 'react';
import { 
  Plus, 
  Building2,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../hooks/use-toast';

const Companies = () => {
  const { companies, selectedCompany, addCompany, updateCompany, deleteCompany, switchCompany } = useCompany();
  const { toast } = useToast();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gstin: '',
    logo: ''
  });

  const handleCreateCompany = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const newCompany = addCompany(formData);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      gstin: '',
      logo: ''
    });
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Company "${newCompany.name}" created successfully`,
    });
  };

  const handleSwitchCompany = (company) => {
    switchCompany(company);
    toast({
      title: "Company Switched",
      description: `Switched to ${company.name}`,
    });
  };

  const handleDeleteCompany = (company) => {
    const success = deleteCompany(company.id);
    if (success) {
      toast({
        title: "Success",
        description: `Company "${company.name}" deleted successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: "Cannot delete the last company",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage multiple companies under your account</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Company</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Company Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gstin">GSTIN</Label>
                  <Input
                    id="gstin"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="Enter GST number"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="Enter logo URL (optional)"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Create Company
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Active Company */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            Active Company
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            {selectedCompany.logo && (
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.name}
                className="h-16 w-16 rounded-lg object-cover border"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedCompany.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {selectedCompany.email}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {selectedCompany.phone}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{selectedCompany.address}</span>
                  </div>
                  {selectedCompany.gstin && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FileText className="h-4 w-4 mr-2" />
                      GSTIN: {selectedCompany.gstin}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Companies</p>
                <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Company</p>
                <p className="text-lg font-semibold text-green-600">{selectedCompany.name}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(selectedCompany.createdAt)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>All Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companies.map((company) => (
              <Card key={company.id} className={`transition-all duration-200 hover:shadow-md ${
                company.id === selectedCompany.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {company.logo && (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="h-12 w-12 rounded-lg object-cover border"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                        {company.id === selectedCompany.id && (
                          <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{company.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                          <span>{company.phone}</span>
                        </div>
                        {company.gstin && (
                          <div className="flex items-center">
                            <FileText className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="font-mono text-xs">{company.gstin}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        {company.id !== selectedCompany.id && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSwitchCompany(company)}
                            className="flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Switch
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-3 w-3" />
                        </Button>
                        {companies.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCompany(company)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Companies;