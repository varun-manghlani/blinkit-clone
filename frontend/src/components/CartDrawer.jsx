import "../styles/CartDrawer.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function CartDrawer({ onClose }) {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    itemsTotal,
    totalItems,
  } = useCart();

  const { openLogin } = useAuth();

  const deliveryCharge = 25;
  const handlingCharge = 2;
  const rainCharge = 15;

  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + rainCharge;

  return (
    <div className="cart-overlay">
      {/* Dark background */}
      <div className="cart-backdrop" onClick={onClose}></div>

      {/* Cart Drawer */}
      <aside className="cart-drawer">
        {/* Header */}
        <div className="cart-header">
          <button className="cart-back-button" onClick={onClose}>
            ←
          </button>

          <h2>My Cart</h2>

          <button className="cart-share">🛒 Share</button>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          {/* Delivery information */}
          <div className="delivery-card">
            <div className="delivery-icon">⏱️</div>

            <div>
              <h3>Delivery in 8 minutes</h3>

              <p>
                Shipment of {totalItems} {totalItems === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {/* Products */}
          <div className="cart-products">
            {cartItems.map((item) => (
              <div
                className="cart-product"
                key={`${item.id}-${item.selectedUnit}`}
              >
                {/* Product image */}
                <div className="cart-product-image">
                  <img src={item.image} alt={item.name} />
                </div>

                {/* Product information */}
                <div className="cart-product-info">
                  <h3>{item.name}</h3>

                  <p>{item.selectedUnit}</p>

                  <strong>₹{item.price}</strong>
                </div>

                {/* Quantity */}
                <div className="cart-quantity">
                  <button
                    onClick={() => decreaseQuantity(item.id, item.selectedUnit)}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQuantity(item.id, item.selectedUnit)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty cart */}
          {cartItems.length === 0 && (
            <div className="empty-cart">
              <div>🛒</div>

              <h3>Your cart is empty</h3>

              <p>Add products to your cart to see them here.</p>
            </div>
          )}

          {/* Bill Details */}
          {cartItems.length > 0 && (
            <div className="bill-card">
              <h2>Bill details</h2>

              <div className="bill-row">
                <span>🧾 Items total</span>

                <span>₹{itemsTotal}</span>
              </div>

              <div className="bill-row">
                <span>🚚 Delivery charge</span>

                <span>₹{deliveryCharge}</span>
              </div>

              <div className="bill-row">
                <span>🛍️ Handling charge</span>

                <span>₹{handlingCharge}</span>
              </div>

              <div className="bill-row">
                <span>🌧️ Rain surge charge</span>

                <span>₹{rainCharge}</span>
              </div>

              <div className="bill-divider"></div>

              <div className="bill-total">
                <strong>Grand total</strong>

                <strong>₹{grandTotal}</strong>
              </div>
            </div>
          )}

          {/* Cancellation policy */}
          {cartItems.length > 0 && (
            <div className="cancellation-card">
              <h2>Cancellation Policy</h2>

              <p>
                Orders cannot be cancelled once packed for delivery. In case of
                unexpected delays, a refund will be provided, if applicable.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Checkout */}
        {cartItems.length > 0 && (
          <div className="cart-bottom">
            <button className="checkout-button" onClick={openLogin}>
              <div className="checkout-total">
                <strong>₹{grandTotal}</strong>

                <span>TOTAL</span>
              </div>

              <div className="checkout-text">Login to Proceed →</div>
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
