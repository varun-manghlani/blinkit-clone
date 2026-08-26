import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../styles/PaymentPage.css";

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { address, cartItems, grandTotal } = location.state || {};

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // ==========================================
  // NO ADDRESS
  // ==========================================

  if (!address) {
    return (
      <div className="payment-page-empty">
        <div className="payment-empty-card">
          <h1>No delivery address</h1>

          <p>Please select a delivery address before making payment.</p>

          <button className="pay-now-button" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // LOAD RAZORPAY CHECKOUT
  // ==========================================

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
      );

      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ==========================================
  // START PAYMENT
  // ==========================================

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError("");

      // ----------------------------------------
      // Load Razorpay
      // ----------------------------------------

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      // ----------------------------------------
      // Create Razorpay Order
      // ----------------------------------------

      const response = await fetch(
        "http://localhost:5000/api/payment/create-order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            amount: Number(grandTotal),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create Razorpay order");
      }

      console.log("Razorpay order created:", data);

      // ----------------------------------------
      // Razorpay Checkout
      // ----------------------------------------

      const options = {
        key: data.keyId,

        amount: data.amount,

        currency: data.currency || "INR",

        name: "Blinkit Clone",

        description: "Grocery Order",

        order_id: data.orderId,

        handler: async function (paymentResponse) {
          try {
            console.log("Payment response:", paymentResponse);

            // ----------------------------------
            // Verify payment
            // ----------------------------------

            const verifyResponse = await fetch(
              "http://localhost:5000/api/payment/verify",
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,

                  razorpay_payment_id: paymentResponse.razorpay_payment_id,

                  razorpay_signature: paymentResponse.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(
                verifyData.message || "Payment verification failed",
              );
            }

            console.log("Payment verified:", verifyData);

            // ----------------------------------
            // Payment Success
            // ----------------------------------

            navigate("/payment-success", {
              state: {
                address: address,

                cartItems: cartItems,

                grandTotal: Number(grandTotal),

                amount: Number(grandTotal),

                paymentId: paymentResponse.razorpay_payment_id,

                orderId: paymentResponse.razorpay_order_id,
              },
            });
          } catch (error) {
            console.error("Payment verification error:", error);

            setPaymentError(error.message || "Payment verification failed.");

            setPaymentLoading(false);
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          address_type: address.type || "Home",
        },

        theme: {
          color: "#0b8f2c",
        },

        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      // ----------------------------------------
      // Open Razorpay
      // ----------------------------------------

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Razorpay payment failed:", response);

        setPaymentError(
          response.error?.description || "Payment failed. Please try again.",
        );

        setPaymentLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);

      setPaymentError(error.message || "Unable to start payment.");

      setPaymentLoading(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="payment-page">
      <div className="payment-container">
        {/* ====================================
            LEFT SIDE
        ==================================== */}

        <div className="payment-method-card">
          <h1 className="payment-title">Select Payment Method</h1>

          <div className="razorpay-payment-section">
            {/* Razorpay Header */}

            <div className="razorpay-header">
              <div>
                <h2>Pay securely with Razorpay</h2>

                <p>Choose your preferred payment method</p>
              </div>

              <div className="razorpay-logo">Razorpay</div>
            </div>

            {/* Payment Methods */}

            <div className="payment-methods">
              {/* UPI */}

              <div className="payment-method active">
                <div className="payment-method-icon">📱</div>

                <div className="payment-method-content">
                  <strong>UPI</strong>

                  <p>Google Pay, PhonePe, Paytm & more</p>
                </div>

                <div className="payment-radio active">✓</div>
              </div>

              {/* Cards */}

              <div className="payment-method">
                <div className="payment-method-icon">💳</div>

                <div className="payment-method-content">
                  <strong>Cards</strong>

                  <p>Credit Card / Debit Card</p>
                </div>

                <div className="payment-radio">○</div>
              </div>

              {/* Net Banking */}

              <div className="payment-method">
                <div className="payment-method-icon">🏦</div>

                <div className="payment-method-content">
                  <strong>Net Banking</strong>

                  <p>All major banks supported</p>
                </div>

                <div className="payment-radio">○</div>
              </div>

              {/* Wallets */}

              <div className="payment-method">
                <div className="payment-method-icon">👛</div>

                <div className="payment-method-content">
                  <strong>Wallets</strong>

                  <p>Pay using supported wallets</p>
                </div>

                <div className="payment-radio">○</div>
              </div>
            </div>

            {/* Security */}

            <div className="secure-payment-info">
              <span>🔒</span>

              <span>Your payment is securely processed by Razorpay</span>
            </div>

            {/* Pay Button */}

            <button
              className="pay-now-button"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading
                ? "Opening Razorpay..."
                : `Pay ₹${grandTotal} Securely`}
            </button>

            {/* Error */}

            {paymentError && (
              <div className="payment-error">{paymentError}</div>
            )}
          </div>
        </div>

        {/* ====================================
            RIGHT SIDE
        ==================================== */}

        <div className="payment-summary">
          {/* Address */}

          <div className="summary-section">
            <h3>Delivery Address</h3>

            <p className="delivery-address-text">
              <strong>{address.type || "Home"}:</strong> {address.house},{" "}
              {address.area}, {address.city}, {address.state} -{" "}
              {address.pincode}
            </p>
          </div>

          {/* Cart */}

          <div className="summary-section">
            <div className="summary-header">
              <span>My Cart</span>

              <span>
                {cartItems?.length || 0}{" "}
                {cartItems?.length === 1 ? "item" : "items"}
              </span>
            </div>

            {cartItems?.map((item) => (
              <div
                className="summary-product"
                key={`${item.id}-${item.selectedUnit}`}
              >
                <img
                  src={`http://localhost:5000${item.image}`}
                  alt={item.name}
                />

                <div className="summary-product-info">
                  <div className="summary-product-name">{item.name}</div>

                  <div className="summary-product-unit">
                    {item.selectedUnit}
                  </div>

                  <div className="summary-product-unit">
                    Qty: {item.quantity}
                  </div>
                </div>

                <div className="summary-product-price">
                  ₹{Number(item.price) * Number(item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}

          <div className="summary-total">
            <span>Total</span>

            <span>₹{grandTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
