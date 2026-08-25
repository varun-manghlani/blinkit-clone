import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/reset-password.css";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const email = sessionStorage.getItem("adminResetEmail");

    const otpVerified = sessionStorage.getItem("adminOtpVerified");

    if (!email || otpVerified !== "true") {
      setError("Password reset session is invalid. Please start again.");

      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields");

      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");

      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
            confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Password update failed");

        return;
      }

      // Clear password reset session
      sessionStorage.removeItem("adminResetEmail");

      sessionStorage.removeItem("adminResetOtp");

      sessionStorage.removeItem("adminOtpVerified");

      // Go back to admin login
      navigate("/admin/login");
    } catch (error) {
      console.error("Reset password error:", error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-logo">Blinkit</div>

        <h1>Create New Password</h1>

        <p className="reset-password-subtitle">
          Enter a new password for your admin account
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}

          <div className="reset-form-group">
            <label htmlFor="new-password">New Password</label>

            <div className="reset-password-input-wrapper">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}

          <div className="reset-form-group">
            <label htmlFor="confirm-password">Confirm Password</label>

            <div className="reset-password-input-wrapper">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />

              <button
                type="button"
                className="reset-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}

          {error && <div className="reset-password-error">{error}</div>}

          {/* Submit */}

          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default ResetPassword;
