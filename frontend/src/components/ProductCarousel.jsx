import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import ProductCard from "./ProductCard";

import "../styles/product-carousel.css";

function ProductCarousel({ title, products, viewAllPath }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

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
    if (!isAnimating) return;

    setCurrentIndex((current) => current + moveCount);
  };

  const handlePrevious = () => {
    if (!isAnimating) return;

    setCurrentIndex((current) => current - moveCount);
  };

  const handleTransitionEnd = () => {
    const totalProducts = products.length;

    if (!totalProducts) return;

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

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="product-carousel-section">
      <div className="product-carousel-header">
        <h2>{title}</h2>

        <button
          className="view-all-button"
          onClick={() => navigate(viewAllPath)}
        >
          View all
        </button>
      </div>

      <div className="product-carousel-wrapper">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={handlePrevious}
          aria-label="Previous products"
        >
          ‹
        </button>

        <div ref={viewportRef} className="product-carousel-viewport">
          <div
            className="product-carousel-track"
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
                className="carousel-product"
                key={`${product.productId}-${index}`}
              >
                <ProductCard
                  product={product}
                  onAdd={() => addToCart(product)}
                  onProductClick={() =>
                    navigate(`/product/${product.productId}`)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={handleNext}
          aria-label="Next products"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default ProductCarousel;
