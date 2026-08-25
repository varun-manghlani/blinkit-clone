import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin-login.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://65.0.32.187:5000/api/admin/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Save admin authentication
      localStorage.setItem("adminToken", data.token);

      localStorage.setItem("admin", JSON.stringify(data.admin));

      // Go to dashboard
      navigate("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-logo">Blinkit</div>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">Sign in to manage your store</p>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="admin-form-group">
            <label htmlFor="admin-email">Email</label>

            <input
              id="admin-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          {/* Password */}
          <div className="admin-form-group">
            <label htmlFor="admin-password">Password</label>

            <div className="password-input-wrapper">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="forgot-password-container">
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => navigate("/admin/forgot-password")}
            >
              Forgot Password?
            </button>
          </div>

          {/* Error */}
          {error && <div className="admin-login-error">{error}</div>}

          {/* Login */}
          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
