import React, { useState } from 'react';
import { 
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useToast } from '../hooks/use-toast';
import { useCompany } from '../context/CompanyContext';

const Settings = () => {
  const { selectedCompany, updateCompany } = useCompany();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [companyData, setCompanyData] = useState({
    name: selectedCompany.name,
    email: selectedCompany.email,
    phone: selectedCompany.phone,
    address: selectedCompany.address,
    gstin: selectedCompany.gstin,
    logo: selectedCompany.logo
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    invoiceReminders: true,
    paymentAlerts: true,
    stockAlerts: true,
    systemUpdates: false
  });

  const [businessSettings, setBusinessSettings] = useState({
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    taxSettings: 'GST',
    invoicePrefix: 'INV',
    quotePrefix: 'QUO',
    defaultPaymentTerms: '30',
    autoSendReminders: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    updateCompany(selectedCompany.id, companyData);
    toast({
      title: "Success",
      description: "Company information updated successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Success",
      description: "Notification preferences updated successfully",
    });
  };

  const handleSaveBusinessSettings = () => {
    toast({
      title: "Success",
      description: "Business settings updated successfully",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export will be emailed to you shortly",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Ready",
      description: "Please select a file to import your data",
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'business', label: 'Business', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const renderProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={profileData.currentPassword}
                  onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={profileData.newPassword}
                  onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderCompanySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyData.name}
                onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyEmail">Email</Label>
              <Input
                id="companyEmail"
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                id="companyPhone"
                value={companyData.phone}
                onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                value={companyData.gstin}
                onChange={(e) => setCompanyData({ ...companyData, gstin: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={companyData.address}
              onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={companyData.logo}
              onChange={(e) => setCompanyData({ ...companyData, logo: e.target.value })}
            />
          </div>
          
          <Button type="submit" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Update Company
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label htmlFor={key} className="text-sm font-medium">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Label>
                <p className="text-sm text-gray-500">
                  {key === 'emailNotifications' && 'Receive notifications via email'}
                  {key === 'smsNotifications' && 'Receive notifications via SMS'}
                  {key === 'invoiceReminders' && 'Get reminded about pending invoices'}
                  {key === 'paymentAlerts' && 'Get notified when payments are received'}
                  {key === 'stockAlerts' && 'Get alerts for low stock items'}
                  {key === 'systemUpdates' && 'Receive system update notifications'}
                </p>
              </div>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(checked) => 
                  setNotifications({ ...notifications, [key]: checked })
                }
              />
            </div>
          ))}
          
          <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderBusinessSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Business Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={businessSettings.currency} onValueChange={(value) => 
                setBusinessSettings({ ...businessSettings, currency: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={businessSettings.timezone} onValueChange={(value) => 
                setBusinessSettings({ ...businessSettings, timezone: value })
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
              <Input
                id="invoicePrefix"
                value={businessSettings.invoicePrefix}
                onChange={(e) => setBusinessSettings({ ...businessSettings, invoicePrefix: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="paymentTerms">Default Payment Terms (Days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={businessSettings.defaultPaymentTerms}
                onChange={(e) => setBusinessSettings({ ...businessSettings, defaultPaymentTerms: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoReminders">Auto Send Payment Reminders</Label>
              <p className="text-sm text-gray-500">Automatically send reminders for overdue invoices</p>
            </div>
            <Switch
              id="autoReminders"
              checked={businessSettings.autoSendReminders}
              onCheckedChange={(checked) => 
                setBusinessSettings({ ...businessSettings, autoSendReminders: checked })
              }
            />
          </div>
          
          <Button onClick={handleSaveBusinessSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download all your business data</p>
              </div>
              <Button onClick={handleExportData} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Import Data</h3>
                <p className="text-sm text-gray-500">Import data from Excel or CSV</p>
              </div>
              <Button onClick={handleImportData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-red-800">Delete Account</h3>
                <p className="text-sm text-red-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and business preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'company' && renderCompanySettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'business' && renderBusinessSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
        </div>
      </div>
    </div>
  );
};

export default Settings;