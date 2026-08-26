import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/CartDrawer.css";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function CartDrawer({ onClose }) {
  const navigate = useNavigate();

  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    itemsTotal,
    totalItems,
  } = useCart();

  const { openLogin, isLoggedIn } = useAuth();

  const [showAddress, setShowAddress] = useState(false);

  const [address, setAddress] = useState({
    house: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    type: "Home",
  });

  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [savedAddress, setSavedAddress] = useState(null);

  const deliveryCharge = 25;
  const handlingCharge = 2;
  const rainCharge = 15;

  const grandTotal = itemsTotal + deliveryCharge + handlingCharge + rainCharge;

  // ==========================================
  // API URL
  // ==========================================

  const API_URL =
    window.location.hostname === "localhost" ? "http://localhost:5000" : "";

  // ==========================================
  // CHECKOUT
  // ==========================================

  const handleCheckout = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    setAddressError("");
    setShowAddress(true);
  };

  // ==========================================
  // ADDRESS CHANGE
  // ==========================================

  const handleAddressChange = (event) => {
    const { name, value } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE ADDRESS
  // ==========================================

  const handleSaveAddress = async (event) => {
    event.preventDefault();

    setAddressError("");

    if (
      !address.house.trim() ||
      !address.area.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      setAddressError("Please fill all address fields.");
      return;
    }

    if (!/^\d{6}$/.test(address.pincode)) {
      setAddressError("Please enter a valid 6-digit pincode.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setShowAddress(false);
      openLogin();
      return;
    }

    try {
      setSavingAddress(true);

      const response = await fetch(`${API_URL}/api/auth/address`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify(address),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save address");
      }

      setSavedAddress(data.address);

      console.log("Address saved:", data.address);
    } catch (error) {
      console.error("Save address error:", error);

      setAddressError(
        error.message || "Failed to save address. Please try again.",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  // ==========================================
  // BACK TO CART
  // ==========================================

  const handleBackToCart = () => {
    setShowAddress(false);
    setAddressError("");
  };

  // ==========================================
  // PROCEED TO PAYMENT
  // ==========================================

  const handleProceedToPayment = () => {
    if (!savedAddress) {
      setAddressError("Please save your address first.");
      return;
    }

    /*
      IMPORTANT:
      Close the CartDrawer BEFORE navigating to payment.

      Previously we only called navigate("/payment"),
      so the payment page opened behind the cart drawer.
    */

    onClose();

    navigate("/payment", {
      state: {
        address: savedAddress,
        cartItems,
        grandTotal,
      },
    });
  };

  return (
    <div className="cart-overlay">
      {/* Dark background */}
      <div className="cart-backdrop" onClick={onClose}></div>

      {/* Cart Drawer */}
      <aside className="cart-drawer">
        {/* ==================================================
            ADDRESS SCREEN
        ================================================== */}

        {showAddress ? (
          <>
            {/* Address Header */}

            <div className="cart-header">
              <button className="cart-back-button" onClick={handleBackToCart}>
                ←
              </button>

              <h2>Delivery Address</h2>

              <div style={{ width: "45px" }}></div>
            </div>

            {/* Address Content */}

            <div className="cart-content address-content">
              {/* ==========================================
                  SAVED ADDRESS
              ========================================== */}

              {savedAddress ? (
                <div className="saved-address-card">
                  <div className="saved-address-success">
                    ✓ Address saved successfully
                  </div>

                  <h2>{savedAddress.type}</h2>

                  <p>
                    {savedAddress.house}, {savedAddress.area}
                  </p>

                  <p>
                    {savedAddress.city}, {savedAddress.state} -{" "}
                    {savedAddress.pincode}
                  </p>

                  {/* Proceed To Pay */}

                  <button
                    type="button"
                    className="proceed-payment-button"
                    onClick={handleProceedToPayment}
                  >
                    Proceed to Pay →
                  </button>
                </div>
              ) : (
                /* ==========================================
                   ADDRESS FORM
                ========================================== */

                <form className="address-form" onSubmit={handleSaveAddress}>
                  <h2>Where should we deliver?</h2>

                  <p className="address-subtitle">
                    Enter your delivery address
                  </p>

                  {/* House */}

                  <label>House / Flat / Building</label>

                  <input
                    type="text"
                    name="house"
                    placeholder="e.g. Flat 201, ABC Apartment"
                    value={address.house}
                    onChange={handleAddressChange}
                  />

                  {/* Area */}

                  <label>Area / Street</label>

                  <input
                    type="text"
                    name="area"
                    placeholder="e.g. Shankar Nagar"
                    value={address.area}
                    onChange={handleAddressChange}
                  />

                  {/* City */}

                  <label>City</label>

                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Raipur"
                    value={address.city}
                    onChange={handleAddressChange}
                  />

                  {/* State */}

                  <label>State</label>

                  <input
                    type="text"
                    name="state"
                    placeholder="e.g. Chhattisgarh"
                    value={address.state}
                    onChange={handleAddressChange}
                  />

                  {/* Pincode */}

                  <label>Pincode</label>

                  <input
                    type="text"
                    name="pincode"
                    placeholder="6-digit pincode"
                    maxLength="6"
                    value={address.pincode}
                    onChange={handleAddressChange}
                  />

                  {/* Address Type */}

                  <label>Address Type</label>

                  <div className="address-type-buttons">
                    {["Home", "Work", "Other"].map((type) => (
                      <button
                        type="button"
                        key={type}
                        className={
                          address.type === type
                            ? "address-type active"
                            : "address-type"
                        }
                        onClick={() =>
                          setAddress((previous) => ({
                            ...previous,
                            type,
                          }))
                        }
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Error */}

                  {addressError && (
                    <p className="address-error">{addressError}</p>
                  )}

                  {/* Save Address */}

                  <button
                    type="submit"
                    className="save-address-button"
                    disabled={savingAddress}
                  >
                    {savingAddress ? "Saving Address..." : "Save Address"}
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          /* ==================================================
             NORMAL CART
          ================================================== */

          <>
            {/* Cart Header */}

            <div className="cart-header">
              <button className="cart-back-button" onClick={onClose}>
                ←
              </button>

              <h2>My Cart</h2>

              <button className="cart-share">🛒 Share</button>
            </div>

            {/* Cart Content */}

            <div className="cart-content">
              {/* Delivery Information */}

              <div className="delivery-card">
                <div className="delivery-icon">⏱️</div>

                <div>
                  <h3>Delivery in 8 minutes</h3>

                  <p>
                    Shipment of {totalItems}{" "}
                    {totalItems === 1 ? "item" : "items"}
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
                    {/* Product Image */}

                    <div className="cart-product-image">
                      <img
                        src={`${
                          window.location.hostname === "localhost"
                            ? "http://localhost:5000"
                            : ""
                        }${item.image}`}
                        alt={item.name}
                      />
                    </div>

                    {/* Product Information */}

                    <div className="cart-product-info">
                      <h3>{item.name}</h3>

                      <p>{item.selectedUnit}</p>

                      <strong>₹{item.price}</strong>
                    </div>

                    {/* Quantity */}

                    <div className="cart-quantity">
                      <button
                        onClick={() =>
                          decreaseQuantity(item.id, item.selectedUnit)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          increaseQuantity(item.id, item.selectedUnit)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty Cart */}

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

              {/* Cancellation Policy */}

              {cartItems.length > 0 && (
                <div className="cancellation-card">
                  <h2>Cancellation Policy</h2>

                  <p>
                    Orders cannot be cancelled once packed for delivery. In case
                    of unexpected delays, a refund will be provided, if
                    applicable.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Checkout */}

            {cartItems.length > 0 && (
              <div className="cart-bottom">
                <button className="checkout-button" onClick={handleCheckout}>
                  <div className="checkout-total">
                    <strong>₹{grandTotal}</strong>
                    <span>TOTAL</span>
                  </div>

                  <div className="checkout-text">
                    {isLoggedIn ? "Proceed →" : "Login to Proceed →"}
                  </div>
                </button>
              </div>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

export default CartDrawer;
