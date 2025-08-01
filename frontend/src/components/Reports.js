import React, { useState } from 'react';
import { 
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  IndianRupee,
  Percent
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Progress } from './ui/progress';
import { mockReports, mockDashboardStats } from '../utils/mockData';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState('sales');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const reports = mockReports;
  const stats = mockDashboardStats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExportReport = () => {
    alert('Report export functionality will be implemented with backend');
  };

  const ReportCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
            <span className="text-sm text-gray-500 ml-1">from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Sales"
          value={formatCurrency(reports.salesReport.totalSales)}
          change="+12.5%"
          trend="up"
          icon={IndianRupee}
          color="text-green-600"
        />
        <ReportCard
          title="Total Tax Collected"
          value={formatCurrency(reports.salesReport.totalTax)}
          change="+8.2%"
          trend="up"
          icon={Percent}
          color="text-blue-600"
        />
        <ReportCard
          title="Net Profit"
          value={formatCurrency(reports.salesReport.netProfit)}
          change="+15.3%"
          trend="up"
          icon={TrendingUp}
          color="text-purple-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.salesReport.topCustomers.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(customer.amount)}</p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderGSTReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">CGST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(reports.gstReport.cgst)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">SGST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(reports.gstReport.sgst)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">IGST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(reports.gstReport.igst)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total GST</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(reports.gstReport.totalGst)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GST Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">GST Payable</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(reports.gstReport.gstPayable)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>• CGST: {formatCurrency(reports.gstReport.cgst)}</p>
              <p>• SGST: {formatCurrency(reports.gstReport.sgst)}</p>
              <p>• IGST: {formatCurrency(reports.gstReport.igst)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInventoryReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard
          title="Total Inventory Value"
          value={formatCurrency(reports.inventoryReport.totalValue)}
          change="+5.2%"
          trend="up"
          icon={IndianRupee}
          color="text-blue-600"
        />
        <ReportCard
          title="Low Stock Items"
          value={reports.inventoryReport.lowStockItems}
          icon={TrendingDown}
          color="text-yellow-600"
        />
        <ReportCard
          title="Out of Stock Items"
          value={reports.inventoryReport.outOfStockItems}
          icon={TrendingDown}
          color="text-red-600"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventory by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.inventoryReport.categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <div className="text-right">
                    <span className="font-semibold">{formatCurrency(category.value)}</span>
                    <span className="text-sm text-gray-500 ml-2">({category.percentage}%)</span>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRevenueChart = () => (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.monthlyChart.map((month, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{month.month}</span>
                <span className="text-gray-600">
                  {formatCurrency(month.revenue)}
                </span>
              </div>
              <Progress 
                value={(month.revenue / 150000) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Detailed insights into your business performance</p>
        </div>
        <Button onClick={handleExportReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Report Type:</span>
            </div>
            <Select value={selectedReport} onValueChange={setSelectedReport}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales Report</SelectItem>
                <SelectItem value="gst">GST Report</SelectItem>
                <SelectItem value="inventory">Inventory Report</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="font-medium">Period:</span>
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {selectedReport === 'sales' && renderSalesReport()}
      {selectedReport === 'gst' && renderGSTReport()}
      {selectedReport === 'inventory' && renderInventoryReport()}

      {/* Revenue Chart (always shown) */}
      {renderRevenueChart()}
    </div>
  );
};

export default Reports;