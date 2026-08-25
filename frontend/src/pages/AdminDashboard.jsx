import "../styles/admin-dashboard.css";
function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-page-title">
        <div>
          <h1>Dashboard</h1>

          <p>Overview of your store</p>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">🛒</span>

          <div>
            <p>Total Orders</p>
            <h2>0</h2>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">❌</span>

          <div>
            <p>Cancelled Orders</p>
            <h2>0</h2>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">📦</span>

          <div>
            <p>Total Products</p>
            <h2>30</h2>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">👥</span>

          <div>
            <p>Total Users</p>
            <h2>0</h2>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <span className="dashboard-stat-icon">👨‍💼</span>

          <div>
            <p>Total Admins</p>
            <h2>1</h2>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Order Overview</h2>
        </div>

        <div className="order-overview-grid">
          <div>
            <span>Pending</span>
            <strong>0</strong>
          </div>

          <div>
            <span>Confirmed</span>
            <strong>0</strong>
          </div>

          <div>
            <span>Preparing</span>
            <strong>0</strong>
          </div>

          <div>
            <span>Out for Delivery</span>
            <strong>0</strong>
          </div>

          <div>
            <span>Delivered</span>
            <strong>0</strong>
          </div>

          <div>
            <span>Cancelled</span>
            <strong>0</strong>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-header">
          <h2>Recent Orders</h2>

          <button>View All</button>
        </div>

        <div className="empty-orders">
          <div className="empty-orders-icon">🛒</div>

          <h3>No orders yet</h3>

          <p>Customer orders will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
