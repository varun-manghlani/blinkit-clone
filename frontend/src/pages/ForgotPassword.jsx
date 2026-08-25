import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/forgot-password.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://65.0.32.187:5000/api/admin/forgot-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      console.log("Demo OTP:", data.developmentOTP);

      // Save email temporarily for the OTP page
      sessionStorage.setItem("adminResetEmail", email);

      // Save demo OTP temporarily for our UI
      sessionStorage.setItem("adminResetOtp", data.developmentOTP);

      // Go to OTP page
      navigate("/admin/reset-otp");
    } catch (error) {
      console.error("Forgot password error:", error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="forgot-password-page">
      <div className="forgot-password-card">
        <div className="forgot-password-logo">Blinkit</div>

        <h1>Forgot Password?</h1>

        <p className="forgot-password-subtitle">
          Enter your admin email to reset your password
        </p>

        <form onSubmit={handleSubmit}>
          <div className="forgot-form-group">
            <label htmlFor="forgot-email">Admin Email</label>

            <input
              id="forgot-email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          {error && <div className="admin-login-error">{error}</div>}

          <button
            type="submit"
            className="forgot-submit-button"
            disabled={loading}
          >
            {loading ? "Checking..." : "Continue"}
          </button>
        </form>

        <button
          type="button"
          className="back-login-button"
          onClick={() => navigate("/admin/login")}
        >
          ← Back to Login
        </button>
      </div>
    </main>
  );
}

export default ForgotPassword;
