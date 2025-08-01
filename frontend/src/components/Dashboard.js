import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  AlertTriangle,
  IndianRupee,
  Package,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { mockDashboardStats } from '../utils/mockData';

const Dashboard = () => {
  const stats = mockDashboardStats;

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
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
            <span className="text-sm text-gray-500 ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change="+12.5%"
          trend="up"
          icon={IndianRupee}
          color="text-green-600"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          change="+8.2%"
          trend="up"
          icon={TrendingUp}
          color="text-blue-600"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(stats.pendingAmount)}
          change="-5.4%"
          trend="down"
          icon={Clock}
          color="text-orange-600"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          change="+4"
          trend="up"
          icon={Users}
          color="text-purple-600"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              Invoice Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Invoices</span>
              <span className="font-semibold">{stats.totalInvoices}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Paid</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {stats.paidInvoices}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending</span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {stats.pendingInvoices}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Overdue</span>
              <Badge variant="destructive">
                {stats.overdueInvoices}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-green-600" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500">{product.sold} sold</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <p className="text-sm text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
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
                    Revenue: {formatCurrency(month.revenue)} | 
                    Expenses: {formatCurrency(month.expenses)}
                  </span>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={(month.revenue / 150000) * 100} 
                    className="h-2 bg-green-100"
                  />
                  <Progress 
                    value={(month.expenses / 150000) * 100} 
                    className="h-2 bg-red-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;