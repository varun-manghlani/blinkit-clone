import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "../styles/promo-page.css";

const API_URL = "http://65.0.32.187:5000";

function PromoPage() {
  const { promoSlug } = useParams();
  const navigate = useNavigate();

  const [promoCard, setPromoCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPromoCard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/promo-cards`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load promo cards");
        }

        const expectedUrl = `/promo/${promoSlug}`;

        const foundCard = (data.promoCards || []).find(
          (card) => card.redirectUrl === expectedUrl,
        );

        if (!foundCard) {
          throw new Error("Promo collection not found");
        }

        setPromoCard(foundCard);
      } catch (error) {
        console.error("Promo page error:", error);

        setError(error.message || "Unable to load promo collection");
      } finally {
        setLoading(false);
      }
    };

    fetchPromoCard();
  }, [promoSlug]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  };

  const getTitle = (slug) => {
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <main className="promo-page">
        <div className="promo-page-message">Loading products...</div>
      </main>
    );
  }

  if (error || !promoCard) {
    return (
      <main className="promo-page">
        <div className="promo-page-message">
          <h2>{error || "Promo collection not found"}</h2>

          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </main>
    );
  }

  const products = promoCard.products || [];

  return (
    <main className="promo-page">
      {/* Back */}

      <button className="promo-back-button" onClick={() => navigate("/")}>
        ← Back to Home
      </button>

      {/* Title */}

      <div className="promo-page-header">
        <h1>{getTitle(promoSlug)}</h1>

        <p>{products.length} products</p>
      </div>

      {/* Products */}

      {products.length === 0 ? (
        <div className="promo-page-message">
          <h2>No products available</h2>

          <p>Products will be added soon.</p>
        </div>
      ) : (
        <div className="promo-products-grid">
          {products.map((product) => (
            <div
              className="promo-product-card"
              key={product._id}
              onClick={() => handleProductClick(product.productId)}
            >
              <div className="promo-product-image">
                <img src={getImageUrl(product.image)} alt={product.name} />
              </div>

              <p className="promo-delivery">⚡ 8 mins</p>

              <h3>{product.name}</h3>

              <p className="promo-quantity">{product.quantity}</p>

              <div className="promo-product-bottom">
                <strong>₹{product.price}</strong>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    console.log("Add product:", product.name);
                  }}
                >
                  ADD
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default PromoPage;
