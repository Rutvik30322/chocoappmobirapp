import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { adminLogout } from '../store/slices/authSlice';
import Sidebar from './Sidebar';
import styles from './Dashboard.module.css';

const Customers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  // Sample customer data
  const customers = [
    { id: '#CUST-001', name: 'John Doe', email: 'john@example.com', phone: '1234567890', orders: 5, totalSpent: '₹6,220', joined: '2023-01-15' },
    { id: '#CUST-002', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543210', orders: 3, totalSpent: '₹2,238', joined: '2023-02-20' },
    { id: '#CUST-003', name: 'Bob Johnson', email: 'bob@example.com', phone: '5551234567', orders: 7, totalSpent: '₹8,120', joined: '2023-03-10' },
    { id: '#CUST-004', name: 'Alice Brown', email: 'alice@example.com', phone: '4449998888', orders: 2, totalSpent: '₹2,194', joined: '2023-04-05' },
    { id: '#CUST-005', name: 'Charlie Wilson', email: 'charlie@example.com', phone: '3337776666', orders: 4, totalSpent: '₹1,824', joined: '2023-05-12' },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.dashboardHeader}>
          <button 
            className={styles.menuToggleBtn} 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <h1 className={styles.dashboardTitle}>Customer Analytics</h1>
          <button className={styles.logoutBtn} onClick={() => {
            dispatch(adminLogout());
            navigate('/login');
          }}>
            Logout
          </button>
        </header>
        
        <div className={styles.dashboardContent}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>All Customers</h2>
            <div>
              <input 
                type="text" 
                placeholder="Search customers..." 
                style={{ padding: '0.5rem', marginRight: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
              />
              <button style={{ 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}>
                Add Customer
              </button>
            </div>
          </div>
          
          <div className={styles.tableContainer} style={{ overflowX: 'auto' }}>
            <table className={styles.table} style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Customer ID</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Orders</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Total Spent</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid #eee', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.id}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.name}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.email}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.phone}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.orders}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.totalSpent}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>{customer.joined}</td>
                    <td style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                      <button style={{ 
                        backgroundColor: '#3b82f6', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '3px', 
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}>
                        View
                      </button>
                      <button style={{ 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '3px', 
                        cursor: 'pointer'
                      }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Customers;