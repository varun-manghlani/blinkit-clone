import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin-reset-otp.css";

function AdminResetOtp() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("adminResetEmail") || "";

  const demoOtp = sessionStorage.getItem("adminResetOtp") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (event) => {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("Reset session expired. Please start again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6 digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/verify-reset-otp",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid OTP");
        return;
      }

      // Backend successfully verified OTP
      sessionStorage.setItem("adminOtpVerified", "true");

      navigate("/admin/reset-password");
    } catch (error) {
      console.error("OTP verification error:", error);

      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-reset-otp-page">
      <div className="admin-reset-otp-card">
        <div className="admin-reset-otp-logo">Blinkit</div>

        <h1>OTP Verification</h1>

        <p className="admin-reset-otp-subtitle">
          Enter the verification code sent to
        </p>

        <strong className="admin-reset-otp-email">{email}</strong>

        <form onSubmit={handleVerify}>
          <div className="otp-inputs">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={otp[index] || ""}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");

                  const otpArray = otp.split("");

                  otpArray[index] = value;

                  const newOtp = otpArray.join("").slice(0, 6);

                  setOtp(newOtp);

                  if (value && event.target.nextElementSibling) {
                    event.target.nextElementSibling.focus();
                  }
                }}
                onKeyDown={(event) => {
                  if (
                    event.key === "Backspace" &&
                    !otp[index] &&
                    event.target.previousElementSibling
                  ) {
                    event.target.previousElementSibling.focus();
                  }
                }}
              />
            ))}
          </div>

          {/* Demo OTP */}

          {demoOtp && (
            <div className="demo-otp">
              Demo OTP: <strong>{demoOtp}</strong>
            </div>
          )}

          {error && <div className="otp-error">{error}</div>}

          <button
            type="submit"
            className="verify-otp-button"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <button
          type="button"
          className="otp-back-button"
          onClick={() => navigate("/admin/forgot-password")}
        >
          ← Change Email
        </button>
      </div>
    </main>
  );
}

export default AdminResetOtp;
