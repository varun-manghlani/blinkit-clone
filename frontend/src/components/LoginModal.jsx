import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

import "../styles/LoginModal.css";

const API_URL = import.meta.env.VITE_API_URL;

function LoginModal() {
  const { showLogin, closeLogin } = useAuth();

  const [step, setStep] = useState("login");

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [developmentOTP, setDevelopmentOTP] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [resendTimer, setResendTimer] = useState(30);

  const otpRefs = useRef([]);

  // ==========================================
  // RESET MODAL WHEN CLOSED
  // ==========================================

  useEffect(() => {
    if (!showLogin) {
      setStep("login");

      setFirstName("");

      setPhone("");

      setOtp(["", "", "", "", "", ""]);

      setDevelopmentOTP("");

      setError("");

      setLoading(false);

      setResendTimer(30);
    }
  }, [showLogin]);

  // ==========================================
  // RESEND TIMER
  // ==========================================

  useEffect(() => {
    if (!showLogin || step !== "otp" || resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showLogin, step, resendTimer]);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleContinue = async (event) => {
    event.preventDefault();

    setError("");

    if (!firstName.trim()) {
      setError("Please enter your first name");

      return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: firstName.trim(),

          phone: `+91${phone}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      // Development OTP
      setDevelopmentOTP(data.developmentOTP);

      // Clear previous OTP
      setOtp(["", "", "", "", "", ""]);

      setResendTimer(30);

      // Open OTP screen
      setStep("otp");
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OTP INPUT
  // ==========================================

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");

    // If user pastes the entire OTP
    if (numericValue.length === 6) {
      const newOTP = numericValue.split("").slice(0, 6);

      setOtp(newOTP);

      otpRefs.current[5]?.focus();

      return;
    }

    // Only one digit
    const digit = numericValue.slice(-1);

    const newOTP = [...otp];

    newOTP[index] = digit;

    setOtp(newOTP);

    // Move to next box
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================
  // BACKSPACE
  // ==========================================

  const handleOTPKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");

    const enteredOTP = otp.join("");

    if (enteredOTP.length !== 6) {
      setError("Please enter the complete 6-digit OTP");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          phone: `+91${phone}`,

          otp: enteredOTP,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      // ======================================
      // LOGIN SUCCESSFUL
      // ======================================

      console.log("Login successful:", data);

      // Store JWT
      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("auth-change"));

      // Store user information
      localStorage.setItem("user", JSON.stringify(data.user));

      // Tell Navbar that login was successful
      window.dispatchEvent(new Event("login-success"));

      // Close modal
      closeLogin();
    } catch (error) {
      console.error("Verify OTP error:", error);

      setError(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP
  // ==========================================

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      return;
    }

    setError("");

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: firstName.trim(),

          phone: `+91${phone}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }

      setDevelopmentOTP(data.developmentOTP);

      setOtp(["", "", "", "", "", ""]);

      setResendTimer(30);

      otpRefs.current[0]?.focus();
    } catch (error) {
      console.error("Resend OTP error:", error);

      setError(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // DON'T RENDER
  // ==========================================

  if (!showLogin) {
    return null;
  }

  // ==========================================
  // OTP SCREEN
  // ==========================================

  if (step === "otp") {
    return (
      <div className="login-overlay">
        <div className="login-modal otp-modal">
          <button
            className="login-back"
            onClick={() => {
              setStep("login");
              setError("");
            }}
          >
            ←
          </button>

          <div className="otp-title">OTP Verification</div>

          <div className="otp-content">
            <p className="otp-message">We have sent a verification code to</p>

            <strong className="otp-phone">+91-{phone}</strong>

            <form onSubmit={handleVerifyOTP}>
              <div className="otp-boxes">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      otpRefs.current[index] = element;
                    }}
                    className="otp-box"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) =>
                      handleOTPChange(index, event.target.value)
                    }
                    onKeyDown={(event) => handleOTPKeyDown(index, event)}
                  />
                ))}
              </div>

              {/* DEVELOPMENT ONLY */}

              <div className="development-otp">
                Demo OTP: <strong>{developmentOTP}</strong>
              </div>

              {error && <p className="otp-error">{error}</p>}

              <button
                type="submit"
                className="verify-button"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>

            <button
              className="resend-button"
              onClick={handleResendOTP}
              disabled={resendTimer > 0 || loading}
            >
              {resendTimer > 0
                ? `Resend Code (in ${resendTimer} secs)`
                : "Resend Code"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOGIN SCREEN
  // ==========================================

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <button className="login-back" onClick={closeLogin}>
          ←
        </button>

        <div className="login-logo">blinkit</div>

        <h1>India's last minute app</h1>

        <form onSubmit={handleContinue}>
          {/* FIRST NAME */}

          <div className="login-input-group">
            <label>First name</label>

            <input
              type="text"
              placeholder="Enter your first name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </div>

          {/* MOBILE */}

          <div className="login-input-group">
            <label>Mobile number</label>

            <div className="mobile-input">
              <span>+91</span>

              <input
                type="tel"
                placeholder="Enter mobile number"
                maxLength={10}
                value={phone}
                onChange={(event) => {
                  const value = event.target.value.replace(/\D/g, "");

                  setPhone(value);
                }}
              />
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-continue" disabled={loading}>
            {loading ? "Sending OTP..." : "Continue"}
          </button>
        </form>

        <p className="login-terms">
          By continuing, you agree to our <span>Terms of service</span> &{" "}
          <span>Privacy policy</span>
        </p>
      </div>
    </div>
  );
}

export default LoginModal;
