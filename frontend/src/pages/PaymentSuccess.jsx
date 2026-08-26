import { useLocation, useNavigate } from "react-router-dom";
import "../styles/PaymentSuccess.css";
function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const { amount, paymentId, orderId } = location.state || {};

  return (
    <div className="payment-success-page">
      <div className="payment-success-card">
        {/* Success Icon */}
        <div className="success-icon-wrapper">
          <div className="success-icon">✓</div>
        </div>

        {/* Heading */}
        <h1>Payment Successful!</h1>

        <p className="success-message">
          Your grocery order has been placed successfully.
        </p>

        {/* Delivery Message */}
        <div className="delivery-success-box">
          <span className="delivery-icon">🛵</span>

          <span>
            Your order will be delivered in <strong>10 min</strong>
          </span>
        </div>

        {/* Payment Details */}
        <div className="payment-details">
          <div className="payment-detail-row">
            <strong>Amount:</strong>

            <span>₹{amount || 0}</span>
          </div>

          <div className="payment-detail-row">
            <strong>Payment ID:</strong>

            <span>{paymentId || "N/A"}</span>
          </div>

          <div className="payment-detail-row">
            <strong>Order ID:</strong>

            <span>{orderId || "N/A"}</span>
          </div>
        </div>

        {/* Continue Shopping */}
        <button
          className="continue-shopping-button"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccess;
