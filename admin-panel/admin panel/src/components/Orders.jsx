import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchOrders, updateOrderStatus, deleteOrder, clearError } from '../store/slices/orderSlice';
import { orderService } from '../services/api';
import Sidebar from './Sidebar';
import Header from './Header';
import dashboardStyles from './Dashboard.module.css';
import styles from './Orders.module.css';

const Orders = () => {
  const dispatch = useDispatch();
  const { items: orders, loading, error, pagination, filters } = useSelector(state => state.orders);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [editingOrder, setEditingOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    statusUpdate: false,
    paymentUpdate: false,
    delete: false,
    pagination: false,
  });


  useEffect(() => {
    // Note: Payment filter would need backend support, for now we'll filter client-side
    const loadOrders = async () => {
      try {
        await dispatch(fetchOrders({ status: statusFilter, page: 1 })).unwrap();
      } catch (error) {
        // If it's a duplicate request error, retry after a short delay
        if (error === 'Duplicate request prevented' || error?.includes?.('Duplicate request prevented')) {
          setTimeout(() => {
            dispatch(fetchOrders({ status: statusFilter, page: 1 }));
          }, 500);
        }
      }
    };
    
    loadOrders();
  }, [dispatch, statusFilter]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleUpdateStatus = (order) => {
    setEditingOrder(order);
    setShowStatusModal(true);
  };

  const confirmStatusUpdate = async (newStatus) => {
    if (editingOrder) {
      try {
        setActionLoading(prev => ({ ...prev, statusUpdate: true }));
        await dispatch(updateOrderStatus({ id: editingOrder._id, orderStatus: newStatus }));
        setShowStatusModal(false);
        setEditingOrder(null);
        // Reload orders
        await dispatch(fetchOrders({ status: statusFilter, page: 1 }));
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update order status: ' + (error || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, statusUpdate: false }));
      }
    }
  };

  const handleUpdatePayment = (order) => {
    setEditingOrder(order);
    setShowPaymentModal(true);
  };

  const confirmPaymentUpdate = async (isPaid) => {
    if (editingOrder) {
      try {
        setActionLoading(prev => ({ ...prev, paymentUpdate: true }));
        await orderService.updateOrderPayment(editingOrder._id, isPaid);
        setShowPaymentModal(false);
        setEditingOrder(null);
        // Reload orders
        await dispatch(fetchOrders({ status: statusFilter, page: 1 }));
      } catch (error) {
        // Don't show error for duplicate request or rate limit
        if (error.message === 'Duplicate request prevented' || error.isRateLimit) {
          // Silently retry after a delay
          setTimeout(() => {
            dispatch(fetchOrders({ status: statusFilter, page: 1 }));
          }, 500);
          return;
        }
        
        // Only show real errors
        const errorMessage = error.response?.data?.message || error.message;
        if (errorMessage !== 'Duplicate request prevented' && !error.isRateLimit) {
          console.error('Error updating payment status:', error);
          alert('Failed to update payment status: ' + errorMessage);
        }
      } finally {
        setActionLoading(prev => ({ ...prev, paymentUpdate: false }));
      }
    }
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
  };

  const handleDeleteOrder = (order) => {
    setDeletingOrder(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (deletingOrder) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }));
        await dispatch(deleteOrder(deletingOrder._id)).unwrap();
        setShowDeleteModal(false);
        setDeletingOrder(null);
        // Reload orders
        await dispatch(fetchOrders({ status: statusFilter, page: 1 }));
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Failed to delete order: ' + (error || 'Unknown error'));
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }));
      }
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteModal(false);
    setDeletingOrder(null);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  if (loading && orders.length === 0) {
    return (
      <div className={dashboardStyles.dashboardContainer}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div>Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.dashboardContainer}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main Content */}
      <main className={`${dashboardStyles.mainContent} ${!sidebarOpen ? dashboardStyles.mainContentExpanded : ''}`}>
        <Header 
          title="Order Management"
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className={dashboardStyles.dashboardContent}>
          {/* Global Loading Overlay */}
          {(loading || actionLoading.statusUpdate || actionLoading.paymentUpdate || actionLoading.delete) && (
            <div className={styles.loadingOverlay}>
              <div className={styles.loadingSpinner}>
                <div className={styles.spinnerLarge}></div>
                <p className={styles.loadingText}>
                  {actionLoading.statusUpdate && 'Updating order status...'}
                  {actionLoading.paymentUpdate && 'Updating payment status...'}
                  {actionLoading.delete && 'Deleting order...'}
                  {loading && !actionLoading.statusUpdate && !actionLoading.paymentUpdate && !actionLoading.delete && 'Loading orders...'}
                </p>
              </div>
            </div>
          )}

          {error && error !== 'Duplicate request prevented' && !error.includes('Duplicate request prevented') && (
            <div className={styles.errorAlert}>
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} aria-label="Close error">✕</button>
            </div>
          )}

          <div className={styles.ordersHeader}>
            <h2 className={styles.ordersTitle}>All Orders</h2>
          </div>

          {/* Filters */}
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroup}>
              <select 
                value={statusFilter}
                onChange={handleStatusChange}
                className={styles.filterSelect}
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <select 
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          
          {Array.isArray(orders) && orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyStateText}>
                No orders found.
              </p>
            </div>
          ) : (
            <>
              {loading && orders.length > 0 && (
                <div className={styles.tableLoadingIndicator}>
                  <span className={styles.spinner}></span>
                  <span>Refreshing orders...</span>
                </div>
              )}
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Order ID</th>
                      <th className={styles.th}>Customer</th>
                      <th className={styles.th}>Date</th>
                      <th className={styles.th}>Items</th>
                      <th className={styles.th}>Amount</th>
                      <th className={styles.th}>Payment</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(orders) && orders
                      .filter(order => {
                        if (paymentFilter === 'paid') return order.isPaid;
                        if (paymentFilter === 'unpaid') return !order.isPaid;
                        return true;
                      })
                      .map((order) => {
                        const customerName = order.user?.name || 'N/A';
                        const customerEmail = order.user?.email || '';
                        const statusClass = `status${order.orderStatus}`;
                        
                        return (
                          <tr key={order._id}>
                            <td className={styles.td}>
                              <span className={styles.orderId}>
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                            </td>
                            <td className={styles.td}>
                              <div className={styles.customerInfo}>
                                <div className={styles.customerName}>{customerName}</div>
                                <div className={styles.customerEmail}>{customerEmail}</div>
                              </div>
                            </td>
                            <td className={`${styles.td} ${styles.dateCell}`}>
                              {formatDate(order.createdAt)}
                            </td>
                            <td className={`${styles.td} ${styles.itemsCell}`}>
                              {order.orderItems?.length || 0} item(s)
                            </td>
                            <td className={`${styles.td} ${styles.amountCell}`}>
                              {formatAmount(order.totalPrice)}
                            </td>
                            <td className={styles.td}>
                              <div>
                                <span className={`${styles.paymentBadge} ${order.isPaid ? styles.paymentPaid : styles.paymentUnpaid}`}>
                                  {order.paymentMethod} {order.isPaid ? '✓ Paid' : '✗ Unpaid'}
                                </span>
                                {order.paidAt && (
                                  <div className={styles.paymentDate}>
                                    Paid: {formatDate(order.paidAt)}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className={styles.td}>
                              <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className={styles.actionsCell}>
                              <button 
                                className={`${styles.actionBtn} ${styles.statusBtn}`}
                                onClick={() => handleUpdateStatus(order)}
                                disabled={loading || actionLoading.statusUpdate || actionLoading.paymentUpdate || actionLoading.delete}
                              >
                                Status
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${order.isPaid ? styles.paymentBtnUnpaid : styles.paymentBtn}`}
                                onClick={() => handleUpdatePayment(order)}
                                disabled={loading || actionLoading.statusUpdate || actionLoading.paymentUpdate || actionLoading.delete}
                              >
                                {order.isPaid ? 'Mark Unpaid' : 'Mark Paid'}
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${styles.viewBtn}`}
                                onClick={() => handleViewOrder(order)}
                                disabled={loading || actionLoading.statusUpdate || actionLoading.paymentUpdate || actionLoading.delete}
                              >
                                View
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                onClick={() => handleDeleteOrder(order)}
                                disabled={loading || actionLoading.statusUpdate || actionLoading.paymentUpdate || actionLoading.delete}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className={styles.paginationContainer}>
                  <button
                    className={styles.paginationBtn}
                    disabled={pagination.page === 1 || actionLoading.pagination || loading}
                    onClick={async () => {
                      setActionLoading(prev => ({ ...prev, pagination: true }));
                      try {
                        await dispatch(fetchOrders({ status: statusFilter, page: pagination.page - 1 }));
                      } finally {
                        setActionLoading(prev => ({ ...prev, pagination: false }));
                      }
                    }}
                  >
                    {actionLoading.pagination ? 'Loading...' : 'Previous'}
                  </button>
                  <span className={styles.paginationInfo}>
                    Page {pagination.page} of {pagination.pages} ({pagination.total || orders.length} total)
                  </span>
                  <button
                    className={styles.paginationBtn}
                    disabled={pagination.page === pagination.pages || actionLoading.pagination || loading}
                    onClick={async () => {
                      setActionLoading(prev => ({ ...prev, pagination: true }));
                      try {
                        await dispatch(fetchOrders({ status: statusFilter, page: pagination.page + 1 }));
                      } finally {
                        setActionLoading(prev => ({ ...prev, pagination: false }));
                      }
                    }}
                  >
                    {actionLoading.pagination ? 'Loading...' : 'Next'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Payment Update Modal */}
      {showPaymentModal && editingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Payment Status</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => {
                  if (!actionLoading.paymentUpdate) {
                    setShowPaymentModal(false);
                    setEditingOrder(null);
                  }
                }}
                disabled={actionLoading.paymentUpdate}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalInfo}>
                Order #{editingOrder._id.slice(-8).toUpperCase()}
              </p>
              <p className={styles.modalInfo}>
                Amount: <strong>{formatAmount(editingOrder.totalPrice)}</strong>
              </p>
              <p className={styles.modalInfo}>
                Current Status: <strong>{editingOrder.isPaid ? 'Paid' : 'Unpaid'}</strong>
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnSuccess}`}
                onClick={() => confirmPaymentUpdate(true)}
                disabled={editingOrder.isPaid || actionLoading.paymentUpdate}
              >
                {actionLoading.paymentUpdate ? (
                  <>
                    <span className={styles.spinner}></span> Updating...
                  </>
                ) : (
                  'Mark as Paid'
                )}
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnDanger}`}
                onClick={() => confirmPaymentUpdate(false)}
                disabled={!editingOrder.isPaid || actionLoading.paymentUpdate}
              >
                {actionLoading.paymentUpdate ? (
                  <>
                    <span className={styles.spinner}></span> Updating...
                  </>
                ) : (
                  'Mark as Unpaid'
                )}
              </button>
            </div>
            <button
              className={styles.modalCancelBtn}
              onClick={() => {
                if (!actionLoading.paymentUpdate) {
                  setShowPaymentModal(false);
                  setEditingOrder(null);
                }
              }}
              disabled={actionLoading.paymentUpdate}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Order Details</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => setViewingOrder(null)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.detailSection}>
                <p className={styles.modalInfo}>
                  <strong>Order ID:</strong> #{viewingOrder._id.slice(-8).toUpperCase()}
                </p>
                <p className={styles.modalInfo}>
                  <strong>Customer:</strong> {viewingOrder.user?.name || 'N/A'} ({viewingOrder.user?.email || 'N/A'})
                </p>
                <p className={styles.modalInfo}>
                  <strong>Date:</strong> {formatDate(viewingOrder.createdAt)}
                </p>
                <p className={styles.modalInfo}>
                  <strong>Payment Method:</strong> {viewingOrder.paymentMethod}
                </p>
                <p className={styles.modalInfo}>
                  <strong>Payment Status:</strong> 
                  <span className={`${styles.paymentBadge} ${viewingOrder.isPaid ? styles.paymentPaid : styles.paymentUnpaid}`} style={{ marginLeft: '0.5rem' }}>
                    {viewingOrder.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </p>
                {viewingOrder.paidAt && (
                  <p className={styles.modalInfo}>
                    <strong>Paid At:</strong> {formatDate(viewingOrder.paidAt)}
                  </p>
                )}
                {viewingOrder.paymentResult && (
                  <div className={styles.modalInfo}>
                    <strong>Payment Details:</strong>
                    <div className={styles.detailSection} style={{ marginTop: '0.5rem' }}>
                      {viewingOrder.paymentResult.id && <div>Transaction ID: {viewingOrder.paymentResult.id}</div>}
                      {viewingOrder.paymentResult.status && <div>Status: {viewingOrder.paymentResult.status}</div>}
                      {viewingOrder.paymentResult.emailAddress && <div>Email: {viewingOrder.paymentResult.emailAddress}</div>}
                    </div>
                  </div>
                )}
                <p className={styles.modalInfo}>
                  <strong>Order Status:</strong> 
                  <span className={`${styles.statusBadge} ${styles[`status${viewingOrder.orderStatus}`]}`} style={{ marginLeft: '0.5rem' }}>
                    {viewingOrder.orderStatus}
                  </span>
                </p>
              </div>

              <div className={styles.detailSection}>
                <strong>Items:</strong>
                <ul className={styles.detailList}>
                  {viewingOrder.orderItems?.map((item, idx) => (
                    <li key={idx}>
                      {item.name} - Qty: {item.quantity} - {formatAmount(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.detailSection}>
                <p className={styles.modalInfo}><strong>Subtotal:</strong> {formatAmount(viewingOrder.itemsPrice)}</p>
                <p className={styles.modalInfo}><strong>Tax:</strong> {formatAmount(viewingOrder.taxPrice)}</p>
                <p className={styles.modalInfo}><strong>Shipping:</strong> {formatAmount(viewingOrder.shippingPrice)}</p>
                <p className={styles.modalInfo} style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                  <strong>Total:</strong> {formatAmount(viewingOrder.totalPrice)}
                </p>
              </div>

              <div className={styles.detailSection}>
                <strong>Shipping Address:</strong>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  {viewingOrder.shippingAddress?.addressLine}, {viewingOrder.shippingAddress?.city}, 
                  {viewingOrder.shippingAddress?.state} - {viewingOrder.shippingAddress?.pincode}
                </div>
              </div>
            </div>

            <button
              className={styles.modalCancelBtn}
              onClick={() => setViewingOrder(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && editingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Update Order Status</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={() => {
                  if (!actionLoading.statusUpdate) {
                    setShowStatusModal(false);
                    setEditingOrder(null);
                  }
                }}
                disabled={actionLoading.statusUpdate}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalInfo}>
                Order #{editingOrder._id.slice(-8).toUpperCase()}
              </p>
              <p className={styles.modalInfo}>
                Current Status: <strong>{editingOrder.orderStatus}</strong>
              </p>
            </div>
            <div className={styles.modalActions}>
              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                  onClick={() => confirmStatusUpdate(status)}
                  disabled={status === editingOrder.orderStatus || actionLoading.statusUpdate}
                >
                  {actionLoading.statusUpdate ? (
                    <>
                      <span className={styles.spinner}></span> Updating...
                    </>
                  ) : (
                    status
                  )}
                </button>
              ))}
            </div>
            <button
              className={styles.modalCancelBtn}
              onClick={() => {
                if (!actionLoading.statusUpdate) {
                  setShowStatusModal(false);
                  setEditingOrder(null);
                }
              }}
              disabled={actionLoading.statusUpdate}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Order Confirmation Modal */}
      {showDeleteModal && deletingOrder && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Delete Order</h3>
              <button
                className={styles.modalCloseBtn}
                onClick={cancelDeleteOrder}
                disabled={actionLoading.delete}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalInfo}>
                Are you sure you want to delete this order?
              </p>
              <p className={styles.modalInfo}>
                <strong>Order ID:</strong> #{deletingOrder._id.slice(-8).toUpperCase()}
              </p>
              <p className={styles.modalInfo}>
                <strong>Customer:</strong> {deletingOrder.user?.name || 'N/A'}
              </p>
              <p className={styles.modalInfo}>
                <strong>Amount:</strong> {formatAmount(deletingOrder.totalPrice)}
              </p>
              <p className={styles.modalInfo} style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '1rem' }}>
                ⚠️ This action cannot be undone!
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnDanger}`}
                onClick={confirmDeleteOrder}
                disabled={actionLoading.delete}
              >
                {actionLoading.delete ? (
                  <>
                    <span className={styles.spinner}></span> Deleting...
                  </>
                ) : (
                  'Delete Order'
                )}
              </button>
              <button
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={cancelDeleteOrder}
                disabled={actionLoading.delete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Orders;
