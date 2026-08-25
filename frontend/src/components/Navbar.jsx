import { useEffect, useState } from "react";

import "../styles/Navbar.css";

import { useCart } from "../context/CartContext";

import { useAuth } from "../context/AuthContext";

import CartDrawer from "./CartDrawer";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { totalItems, itemsTotal } = useCart();

  const { openLogin } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);

  const [user, setUser] = useState(null);

  const [accountOpen, setAccountOpen] = useState(false);

  const navigate = useNavigate();

  // ==========================================
  // CHECK LOGIN STATUS
  // ==========================================

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Invalid user data");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Check when Navbar loads
    loadUser();

    // Check immediately after login
    window.addEventListener("login-success", loadUser);

    return () => {
      window.removeEventListener("login-success", loadUser);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem("user");

    setUser(null);

    setAccountOpen(false);
  };

  return (
    <>
      <nav className="navbar">
        {/* Logo */}

        <div className="logo" onClick={() => navigate("/")}>
          Blinkit
        </div>

        {/* Location */}

        <div className="location">
          <span>📍</span>

          <div>
            <small>Delivery in</small>

            <strong>10 minutes</strong>
          </div>
        </div>

        {/* Search */}

        <div className="search-box" onClick={() => navigate("/search")}>
          <span>🔍</span>

          <input type="text" placeholder="Search for products..." readOnly />
        </div>

        {/* Actions */}

        <div className="nav-actions">
          {/* ==================================
              LOGIN / ACCOUNT
              ================================== */}

          {user ? (
            <div className="account-wrapper">
              <button
                className="account-button"
                onClick={() => setAccountOpen((previous) => !previous)}
              >
                Account
                <span
                  className={
                    accountOpen
                      ? "account-arrow account-arrow-open"
                      : "account-arrow"
                  }
                >
                  ▼
                </span>
              </button>

              {/* ACCOUNT DROPDOWN */}

              {accountOpen && (
                <div className="account-dropdown">
                  {/* Account information */}

                  <div className="account-header">
                    <h3>My Account</h3>

                    <p>{user.phone}</p>
                  </div>

                  {/* Menu */}

                  <div className="account-menu">
                    <button>My Orders</button>

                    <button>Saved Addresses</button>

                    <button>My Prescriptions</button>

                    <button>E-Gift Cards</button>

                    <button>FAQ's</button>

                    <button>Account Privacy</button>

                    <button className="logout-button" onClick={handleLogout}>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openLogin}>Login</button>
          )}

          {/* ==================================
              CART
              ================================== */}

          <button
            className={
              totalItems > 0 ? "cart-button cart-active" : "cart-button"
            }
            onClick={() => setCartOpen(true)}
          >
            <span className="cart-icon">🛒</span>

            {totalItems === 0 ? (
              "Cart"
            ) : (
              <span className="cart-summary">
                <strong>
                  {totalItems} {totalItems === 1 ? "item" : "items"}
                </strong>

                <span>₹{itemsTotal}</span>
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  );
}

export default Navbar;
