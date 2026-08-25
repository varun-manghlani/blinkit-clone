import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";

import "../styles/product-details.css";

const API_URL = "http://65.0.32.187:5000";

// ==========================================
// PRODUCT IMAGE URL
// ==========================================

const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  // Already a complete URL
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  // Backend stores paths like:
  // /uploads/products/product-123.png
  return `${API_URL}${image}`;
};

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { cartItems, addToCart, increaseQuantity, decreaseQuantity } =
    useCart();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // GET PRODUCT
  // ==========================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/products/${id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch product");
        }

        setProduct({
          ...data,
          id: data.productId,
        });
      } catch (error) {
        console.error("Product details error:", error);

        setError(error.message || "Unable to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const [selectedUnit, setSelectedUnit] = useState("");

  // ==========================================
  // SET INITIAL UNIT
  // ==========================================

  useEffect(() => {
    if (product) {
      setSelectedUnit(product.quantity || "1 unit");
    }
  }, [product]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <h2>Loading product...</h2>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error || !product) {
    return (
      <div className="product-not-found">
        <h2>{error || "Product not found"}</h2>

        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  // ==========================================
  // PRODUCT IMAGE
  // ==========================================

  const productImage = getImageUrl(product.image);

  // ==========================================
  // UNIT OPTIONS
  // ==========================================

  const units = [
    {
      name: product.quantity,
      price: product.price,
      mrp: product.mrp,
      discount: product.discount || 0,
    },

    {
      name: `2 × ${product.quantity}`,
      price: product.price * 2 - 1,
      mrp: product.mrp * 2,
      discount:
        product.mrp > 0
          ? Math.round(
              ((product.mrp * 2 - (product.price * 2 - 1)) /
                (product.mrp * 2)) *
                100,
            )
          : 0,
    },
  ];

  const selectedUnitData =
    units.find((unit) => unit.name === selectedUnit) || units[0];

  // ==========================================
  // CART
  // ==========================================

  const cartItem = cartItems.find(
    (item) =>
      item.id === product.id && item.selectedUnit === selectedUnitData.name,
  );

  const quantity = cartItem ? cartItem.quantity : 0;

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = () => {
    addToCart(
      {
        ...product,

        id: product.productId,

        selectedUnit: selectedUnitData.name,

        price: selectedUnitData.price,

        mrp: selectedUnitData.mrp,
      },
      1,
    );
  };

  // ==========================================
  // INCREASE
  // ==========================================

  const handleIncrease = () => {
    increaseQuantity(product.id, selectedUnitData.name);
  };

  // ==========================================
  // DECREASE
  // ==========================================

  const handleDecrease = () => {
    decreaseQuantity(product.id, selectedUnitData.name);
  };

  return (
    <main className="product-details-page">
      {/* ======================================
          BREADCRUMB
          ====================================== */}

      <div className="product-breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>

        {" / "}

        <span onClick={() => navigate(`/category/${product.categorySlug}`)}>
          {product.category}
        </span>

        {" / "}

        <strong>{product.name}</strong>
      </div>

      {/* ======================================
          MAIN PRODUCT
          ====================================== */}

      <section className="product-main">
        {/* ====================================
            GALLERY
            ==================================== */}

        <div className="product-gallery">
          <div className="main-product-image">
            <img src={productImage} alt={product.name} />
          </div>

          <div className="product-thumbnails">
            <div className="thumbnail active">
              <img src={productImage} alt={product.name} />
            </div>

            <div className="thumbnail">
              <img src={productImage} alt={product.name} />
            </div>

            <div className="thumbnail">
              <img src={productImage} alt={product.name} />
            </div>
          </div>
        </div>

        {/* ====================================
            INFORMATION
            ==================================== */}

        <div className="product-information">
          <h1>{product.name}</h1>

          <p className="select-unit">Select Unit</p>

          {/* ==================================
              UNIT OPTIONS
              ================================== */}

          <div className="unit-options">
            {units.map((unit) => (
              <button
                key={unit.name}
                className={`unit-option ${
                  selectedUnit === unit.name ? "selected" : ""
                }`}
                onClick={() => setSelectedUnit(unit.name)}
              >
                <span className="unit-discount">{unit.discount}% OFF</span>

                <span className="unit-name">{unit.name}</span>

                <span className="unit-price">₹{unit.price}</span>

                <del>₹{unit.mrp}</del>
              </button>
            ))}
          </div>

          {/* ==================================
              SELECTED PRICE
              ================================== */}

          <div className="selected-product-price">
            <p>{selectedUnitData.name}</p>

            <div>
              <strong>₹{selectedUnitData.price}</strong>

              <del>₹{selectedUnitData.mrp}</del>

              <span>{selectedUnitData.discount}% OFF</span>
            </div>

            <small>(Inclusive of all taxes)</small>
          </div>

          {/* ==================================
              CART
              ================================== */}

          <div className="product-cart-action">
            {quantity === 0 ? (
              <button className="add-cart-button" onClick={handleAddToCart}>
                Add to cart
              </button>
            ) : (
              <div className="product-quantity-control">
                <button onClick={handleDecrease}>−</button>

                <span>{quantity}</span>

                <button onClick={handleIncrease}>+</button>
              </div>
            )}
          </div>

          {/* =================================
              WHY BLINKIT
              ================================= */}

          <div className="why-blinkit">
            <h2>Why shop from blinkit?</h2>

            <div className="benefit">
              <div className="benefit-icon">⚡</div>

              <div>
                <h3>Round The Clock Delivery</h3>

                <p>
                  Get items delivered to your doorstep from dark stores near
                  you, whenever you need them.
                </p>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">💰</div>

              <div>
                <h3>Best Prices & Offers</h3>

                <p>
                  Best price destination with offers directly from the
                  manufacturers.
                </p>
              </div>
            </div>

            <div className="benefit">
              <div className="benefit-icon">🛒</div>

              <div>
                <h3>Wide Assortment</h3>

                <p>
                  Choose from thousands of products across multiple categories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          DESCRIPTION
          ====================================== */}

      <section className="product-description">
        <h2>Product Details</h2>

        <p>{product.description}</p>

        <button>View more details</button>
      </section>
    </main>
  );
}

export default ProductDetails;
