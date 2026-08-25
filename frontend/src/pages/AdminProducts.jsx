import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin-products.css";

const API_URL = "http://65.0.32.187:5000";

function AdminProducts() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/admin/products`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load products");
        }

        setProducts(data.products || []);
      } catch (error) {
        console.error("Admin products error:", error);

        setError(error.message || "Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    return `${API_URL}${image}`;
  };

  const openProduct = (product) => {
    navigate(`/admin/products/${product.productId}`);
  };

  const searchResults = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(value) ||
        product.category?.toLowerCase().includes(value) ||
        product.categorySlug?.toLowerCase().includes(value)
      );
    });
  }, [products, search]);

  const getFive = (slug) => {
    return products
      .filter((product) => product.categorySlug === slug)
      .slice(0, 5);
  };

  const row1 = [
    ...getFive("fruits-vegetables"),
    ...getFive("dairy-breakfast"),
    ...getFive("pharmacy"),
  ];

  const row2 = [
    ...getFive("snacks"),
    ...getFive("beverages"),
    ...getFive("pet-supplies"),
  ];

  const row3 = [
    ...getFive("bakery"),
    ...getFive("household"),
    ...getFive("baby-care"),
  ];

  if (loading) {
    return (
      <main className="admin-products-page">
        <div className="admin-products-loading">Loading products...</div>
      </main>
    );
  }

  return (
    <main className="admin-products-page">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="admin-products-header">
        <div>
          <button
            type="button"
            className="admin-products-back"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>Products</h1>

          <p>Manage your store products</p>
        </div>

        <button
          type="button"
          className="admin-add-product-button"
          onClick={() => navigate("/admin/products/new")}
        >
          + Add Product
        </button>
      </div>

      {error && <div className="admin-products-error">{error}</div>}

      {/* ==========================================
          SEARCH
      ========================================== */}

      <div className="admin-product-search-box">
        <span className="admin-product-search-icon">🔍</span>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
        />

        {search && (
          <button
            type="button"
            className="admin-product-search-clear"
            onClick={() => setSearch("")}
          >
            ×
          </button>
        )}
      </div>

      {/* ==========================================
          SEARCH RESULTS
      ========================================== */}

      {search.trim() && (
        <section className="admin-search-results-section">
          <div className="admin-search-results-header">
            <div>
              <h2>Search results for "{search}"</h2>

              <p>
                {searchResults.length} product
                {searchResults.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          {searchResults.length === 0 ? (
            <div className="admin-search-empty">No products found.</div>
          ) : (
            <div className="admin-search-results">
              {searchResults.map((product) => (
                <div
                  key={product.productId}
                  className="admin-search-product-row"
                  onClick={() => openProduct(product)}
                >
                  <div className="admin-search-product-image">
                    <img src={getImageUrl(product.image)} alt={product.name} />
                  </div>

                  <div className="admin-search-product-info">
                    <h3>{product.name}</h3>

                    <p>{product.category}</p>

                    <span>{product.quantity}</span>
                  </div>

                  <div className="admin-search-product-price">
                    ₹{product.price}
                  </div>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openProduct(product);
                    }}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ==========================================
          HOME PRODUCT ROWS
      ========================================== */}

      <AdminProductCarousel
        title="Fresh Produce, Dairy & Pharmacy"
        products={row1}
        onProductClick={openProduct}
      />

      <AdminProductCarousel
        title="Snacks, Beverages & Pet Supplies"
        products={row2}
        onProductClick={openProduct}
      />

      <AdminProductCarousel
        title="Bakery, Household & Baby Care"
        products={row3}
        onProductClick={openProduct}
      />
    </main>
  );
}

/* ==================================================
   ADMIN PRODUCT CAROUSEL
================================================== */

function AdminProductCarousel({ title, products, onProductClick }) {
  const viewportRef = useRef(null);

  const visibleCount = 5;
  const moveCount = 5;

  const carouselProducts = [...products, ...products, ...products];

  const [currentIndex, setCurrentIndex] = useState(products.length);

  const [cardStep, setCardStep] = useState(0);

  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    setCurrentIndex(products.length);
  }, [products.length]);

  useEffect(() => {
    const calculateCardStep = () => {
      if (!viewportRef.current) {
        return;
      }

      const viewportWidth = viewportRef.current.offsetWidth;

      const gap = 16;

      const cardWidth =
        (viewportWidth - gap * (visibleCount - 1)) / visibleCount;

      setCardStep(cardWidth + gap);
    };

    calculateCardStep();

    window.addEventListener("resize", calculateCardStep);

    return () => {
      window.removeEventListener("resize", calculateCardStep);
    };
  }, []);

  const handleNext = () => {
    if (!isAnimating) {
      return;
    }

    setCurrentIndex((current) => current + moveCount);
  };

  const handlePrevious = () => {
    if (!isAnimating) {
      return;
    }

    setCurrentIndex((current) => current - moveCount);
  };

  const handleTransitionEnd = () => {
    const totalProducts = products.length;

    if (!totalProducts) {
      return;
    }

    if (currentIndex >= totalProducts * 2) {
      setIsAnimating(false);

      setCurrentIndex(currentIndex - totalProducts);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });

      return;
    }

    if (currentIndex < totalProducts) {
      setIsAnimating(false);

      setCurrentIndex(currentIndex + totalProducts);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    }
  };

  if (!products.length) {
    return null;
  }

  return (
    <section className="admin-product-carousel-section">
      <div className="admin-product-carousel-header">
        <h2>{title}</h2>
      </div>

      <div className="admin-product-carousel-wrapper">
        <button
          type="button"
          className="admin-carousel-arrow admin-carousel-arrow-left"
          onClick={handlePrevious}
          aria-label="Previous products"
        >
          ‹
        </button>

        <div ref={viewportRef} className="admin-product-carousel-viewport">
          <div
            className="admin-product-carousel-track"
            onTransitionEnd={handleTransitionEnd}
            style={{
              gap: "16px",

              transform: `translateX(-${currentIndex * cardStep}px)`,

              transition: isAnimating
                ? "transform 280ms cubic-bezier(0.25, 0.8, 0.25, 1)"
                : "none",
            }}
          >
            {carouselProducts.map((product, index) => (
              <div
                key={`${product.productId}-${index}`}
                className="admin-carousel-product"
                onClick={() => onProductClick(product)}
              >
                <div className="admin-product-card">
                  <div className="admin-product-card-image">
                    <img
                      src={getAdminImageUrl(product.image)}
                      alt={product.name}
                    />
                  </div>

                  <p className="admin-product-delivery">⚡ 8 mins</p>

                  <h3>{product.name}</h3>

                  <p className="admin-product-quantity">{product.quantity}</p>

                  <div className="admin-product-bottom">
                    <strong>₹{product.price}</strong>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();

                        onProductClick(product);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="admin-carousel-arrow admin-carousel-arrow-right"
          onClick={handleNext}
          aria-label="Next products"
        >
          ›
        </button>
      </div>
    </section>
  );
}

function getAdminImageUrl(image) {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_URL}${image}`;
}

export default AdminProducts;
