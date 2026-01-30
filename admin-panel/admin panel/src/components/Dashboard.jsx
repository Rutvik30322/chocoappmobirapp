import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { orderService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationToast from './NotificationToast';
import styles from './Dashboard.module.css';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderService.getDashboardStats();
      
      // Handle response structure: response.data.data.stats (from apiResponse.js)
      // The backend returns: { success, statusCode, message, data: { stats: {...} } }
      const statsData = response.data?.data?.stats || response.data?.stats || response.data;
      
      if (process.env.NODE_ENV === 'development') {
      
      }
      
      if (!statsData) {
        throw new Error('No stats data received from API');
      }
      
      setStats(statsData);
    } catch (error) {
      // Don't show error for duplicate request prevention - just retry silently
      if (error.message === 'Duplicate request prevented') {
        // Wait a bit and retry once silently
        setTimeout(() => {
          fetchDashboardStats();
        }, 500);
        return;
      }
      
      // Don't show error for rate limit - it's handled silently
      if (error.isRateLimit) {
        // Wait and retry after rate limit
        setTimeout(() => {
          fetchDashboardStats();
        }, (error.retryAfter || 5) * 1000);
        return;
      }
      
      // Only log and show real errors
      if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching dashboard stats:', error);
        console.error('Error details:', error.response?.data || error.message);
      }
      
      // Only show error if it's a real error (not duplicate or rate limit)
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage !== 'Duplicate request prevented' && !error.isRateLimit) {
        setError(`Failed to load dashboard data: ${errorMessage}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Prepare chart data
  const prepareRevenueData = () => {
    if (!stats?.revenueByMonth || stats.revenueByMonth.length === 0) {
      return [];
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return stats.revenueByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.revenue || 0,
      orders: item.count || 0,
    }));
  };

  const prepareOrdersByMonthData = () => {
    if (!stats?.ordersByMonth || stats.ordersByMonth.length === 0) {
      return [];
    }
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return stats.ordersByMonth.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      orders: item.count || 0,
    }));
  };

  const prepareOrdersByStatusData = () => {
    if (!stats?.ordersByStatus || stats.ordersByStatus.length === 0) {
      return [];
    }
    
    return stats.ordersByStatus.map((item) => ({
      name: item._id || 'Unknown',
      value: item.count || 0,
    }));
  };

  const preparePaymentMethodData = () => {
    if (!stats?.ordersByPaymentMethod || stats.ordersByPaymentMethod.length === 0) {
      return [];
    }
    
    return stats.ordersByPaymentMethod.map((item) => ({
      name: item._id || 'Unknown',
      value: item.count || 0,
      paid: item.paid || 0,
      unpaid: item.unpaid || 0,
    }));
  };

  const prepareRevenueByPaymentMethodData = () => {
    if (!stats?.revenueByPaymentMethod || stats.revenueByPaymentMethod.length === 0) {
      return [];
    }
    
    return stats.revenueByPaymentMethod.map((item) => ({
      method: item._id || 'Unknown',
      revenue: item.revenue || 0,
      orders: item.count || 0,
    }));
  };

  // Chart colors
  const STATUS_COLORS = {
    'Pending': '#f59e0b',
    'Processing': '#3b82f6',
    'Shipped': '#8b5cf6',
    'Delivered': '#10b981',
    'Cancelled': '#ef4444',
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || '#6b7280';
  };

  const revenueData = prepareRevenueData();
  const ordersByStatusData = prepareOrdersByStatusData();
  const ordersByMonthData = prepareOrdersByMonthData();
  const paymentMethodData = preparePaymentMethodData();
  const revenueByPaymentMethodData = prepareRevenueByPaymentMethodData();

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className={styles.mainContent}>
          <div className={styles.loading}>Loading dashboard...</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Notification Toast */}
      <NotificationToast />
      
      {/* Main Content */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentExpanded : ''}`}>
        <Header 
          title="Admin Dashboard"
          onRefresh={fetchDashboardStats}
          refreshLoading={loading}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={styles.dashboardContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 className={styles.welcomeTitle}>Welcome to the Admin Dashboard</h2>
          </div>
          
          {error && (
            <div className={styles.errorMessage}>
              {error}
              <button onClick={fetchDashboardStats} className={styles.retryBtn}>Retry</button>
            </div>
          )}
          
          {/* Additional Stats Cards */}
          {stats && (
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📊</div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statValue}>{formatCurrency(stats.avgOrderValue || 0)}</h3>
                  <p className={styles.statLabel}>Average Order Value</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>✅</div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statValue}>{stats.activeUsers || 0}</h3>
                  <p className={styles.statLabel}>Active Users</p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>💳</div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statValue}>{stats.paidOrders || 0}</h3>
                  <p className={styles.statLabel}>Paid Orders</p>
                  <p className={styles.statSubLabel}>
                    {stats.unpaidOrders || 0} unpaid
                  </p>
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statInfo}>
                  <h3 className={styles.statValue}>
                    {stats.totalOrders > 0 
                      ? `${((stats.paidOrders / stats.totalOrders) * 100).toFixed(1)}%`
                      : '0%'}
                  </h3>
                  <p className={styles.statLabel}>Payment Rate</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📦</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalProducts || 0}</h3>
                <p className={styles.statLabel}>Total Products</p>
                {stats?.outOfStockProducts > 0 && (
                  <p className={styles.statSubLabel}>
                    {stats.outOfStockProducts} out of stock
                  </p>
                )}
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>📋</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalOrders || 0}</h3>
                <p className={styles.statLabel}>Total Orders</p>
                <p className={styles.statSubLabel}>
                  {stats?.thisMonthOrders || 0} this month, {stats?.todayOrders || 0} today
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{formatCurrency(stats?.totalRevenue)}</h3>
                <p className={styles.statLabel}>Total Revenue</p>
                <p className={styles.statSubLabel}>
                  {formatCurrency(stats?.thisMonthRevenue || 0)} this month
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalUsers || 0}</h3>
                <p className={styles.statLabel}>Total Users</p>
                <p className={styles.statSubLabel}>
                  {stats?.customers || 0} customers, {stats?.admins || 0} admins
                </p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏷️</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalCategories || 0}</h3>
                <p className={styles.statLabel}>Categories</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statInfo}>
                <h3 className={styles.statValue}>{stats?.totalReviews || 0}</h3>
                <p className={styles.statLabel}>Total Reviews</p>
                <p className={styles.statSubLabel}>
                  {stats?.approvedReviews || 0} approved, {stats?.pendingReviews || 0} pending
                </p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className={styles.chartsGrid}>
            {/* Revenue Chart */}
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Revenue Trend (Last 6 Months)</h3>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#333' }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>
                  <p>No revenue data available for the last 6 months</p>
                </div>
              )}
            </div>

            {/* Orders by Status Pie Chart */}
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Orders by Status</h3>
              {ordersByStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ordersByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {ordersByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>
                  <p>No orders data available</p>
                </div>
              )}
            </div>

            {/* Orders Count Chart */}
            <div className={styles.chartSection}>
              <h3 className={styles.sectionTitle}>Orders Count (Last 6 Months)</h3>
              {ordersByMonthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ordersByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10b981" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className={styles.emptyChart}>
                  <p>No orders data available for the last 6 months</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Statistics Charts */}
          <div className={styles.chartsGrid}>
            {/* Payment Method Distribution */}
            {paymentMethodData.length > 0 && (
              <div className={styles.chartSection}>
                <h3 className={styles.sectionTitle}>Orders by Payment Method</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Revenue by Payment Method */}
            {revenueByPaymentMethodData.length > 0 && (
              <div className={styles.chartSection}>
                <h3 className={styles.sectionTitle}>Revenue by Payment Method</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByPaymentMethodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="method" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ color: '#333' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8b5cf6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Payment Status Breakdown */}
            {stats?.paymentStatusBreakdown && (
              <div className={styles.chartSection}>
                <h3 className={styles.sectionTitle}>Payment Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Paid', value: stats.paymentStatusBreakdown.paid || 0 },
                        { name: 'Unpaid', value: stats.paymentStatusBreakdown.unpaid || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Orders by Status Cards */}
          {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Orders by Status Overview</h3>
              <div className={styles.statusGrid}>
                {stats.ordersByStatus.map((status) => (
                  <div key={status._id} className={styles.statusCard}>
                    <span className={styles.statusName}>{status._id || 'Pending'}</span>
                    <span className={styles.statusCount}>{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Recent Orders</h3>
              <div className={styles.recentOrdersTable}>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.slice(-6)}</td>
                        <td>{order.user?.name || 'N/A'}</td>
                        <td>{formatCurrency(order.totalPrice)}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[order.orderStatus]}`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Quick Actions</h3>
            <div className={styles.quickActions}>
              <a href="/products" className={styles.actionCard}>
                <div className={styles.actionIcon}>📦</div>
                <h3>Manage Products</h3>
                <p>Add, edit, and manage your chocolate products</p>
              </a>
              
              <a href="/orders" className={styles.actionCard}>
                <div className={styles.actionIcon}>📋</div>
                <h3>View Orders</h3>
                <p>Check and manage customer orders</p>
              </a>
              
              <a href="/customers" className={styles.actionCard}>
                <div className={styles.actionIcon}>👥</div>
                <h3>Customer List</h3>
                <p>View and manage customer information</p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;