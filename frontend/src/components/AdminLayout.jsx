import { NavLink, Outlet, useNavigate } from "react-router-dom";

import "../styles/admin-layout.css";

function AdminLayout() {
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin") || "null");

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          Blinkit
          <span>Admin</span>
        </div>

        <nav className="admin-navigation">
          <NavLink to="/admin/dashboard" className="admin-nav-link">
            <span>📊</span>
            Dashboard
          </NavLink>

          <NavLink to="/admin/products" className="admin-nav-link">
            <span>📦</span>
            Products
          </NavLink>

          <NavLink to="/admin/categories" className="admin-nav-link">
            <span>🗂️</span>
            Categories
          </NavLink>

          <NavLink to="/admin/promo-cards" className="admin-nav-link">
            <span>🎁</span>
            Promo Cards
          </NavLink>

          <NavLink to="/admin/banners" className="admin-nav-link">
            <span>🖼️</span>
            Hero Banner
          </NavLink>

          <NavLink to="/admin/orders" className="admin-nav-link">
            <span>🛒</span>
            Orders
          </NavLink>

          <NavLink to="/admin/settings" className="admin-nav-link">
            <span>⚙️</span>
            Settings
          </NavLink>
        </nav>

        <button className="admin-logout-button" onClick={handleLogout}>
          <span>↪</span>
          Logout
        </button>
      </aside>

      {/* Main Area */}

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <h2>Admin Panel</h2>

            <p>Manage your Blinkit store</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">
              {admin?.name ? admin.name.charAt(0).toUpperCase() : "A"}
            </div>

            <div className="admin-profile-info">
              <strong>{admin?.name || "Admin"}</strong>

              <span>{admin?.email || ""}</span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
