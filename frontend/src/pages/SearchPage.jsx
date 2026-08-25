import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import { useCart } from "../context/CartContext";

import "../styles/search-page.css";

function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { addToCart } = useCart();

  const searchFromUrl = searchParams.get("q") || "";

  const [search, setSearch] = useState(searchFromUrl);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get products from MongoDB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://65.0.32.187:5000/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Search products error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Update URL when search changes
  useEffect(() => {
    if (search.trim()) {
      setSearchParams({ q: search });
    } else {
      setSearchParams({});
    }
  }, [search, setSearchParams]);

  // Find matching products
  const matchingProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.categorySlug,
        product.description,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [products, search]);

  /*
    These are the same 3 sections we planned
    for the Home page.
  */
  const sections = [
    {
      title: "Fresh Produce & Dairy",
      categories: ["fruits-vegetables", "dairy-breakfast"],
    },
    {
      title: "Snacks & Beverages",
      categories: ["snacks", "beverages"],
    },
    {
      title: "Bakery & Household Essentials",
      categories: ["bakery", "household"],
    },
  ];

  return (
    <main className="search-page">
      {/* Search input */}

      <div className="search-page-bar">
        <span className="search-page-icon">🔍</span>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search for products..."
          autoFocus
        />

        {search && (
          <button className="search-clear" onClick={() => setSearch("")}>
            ×
          </button>
        )}
      </div>

      {loading && <div className="search-message">Loading products...</div>}

      {!loading && search.trim() === "" && (
        <div className="search-empty">
          <h2>Search for products</h2>

          <p>Find fruits, vegetables, dairy, snacks and more.</p>
        </div>
      )}

      {!loading && search.trim() !== "" && (
        <>
          {/* SEARCH RESULT TITLE */}

          <h2 className="search-result-title">
            Showing results for "{search}"
          </h2>

          {/* SEARCHED PRODUCTS */}

          {matchingProducts.length > 0 ? (
            <div className="search-products">
              {matchingProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onAdd={() => addToCart(product)}
                  onProductClick={() =>
                    navigate(`/product/${product.productId}`)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="search-no-results">
              <p>No products found.</p>

              <div className="search-products">
                {products.slice(0, 6).map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    onAdd={() => addToCart(product)}
                    onProductClick={() =>
                      navigate(`/product/${product.productId}`)
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* RELATED PRODUCTS */}

          <h2 className="related-products-title">Showing related products</h2>

          {/* THREE HOME SECTIONS */}

          {sections.map((section) => {
            const sectionProducts = products.filter((product) =>
              section.categories.includes(product.categorySlug),
            );

            return (
              <SearchProductSection
                key={section.title}
                title={section.title}
                products={sectionProducts}
                onAdd={addToCart}
                onProductClick={(product) =>
                  navigate(`/product/${product.productId}`)
                }
              />
            );
          })}
        </>
      )}
    </main>
  );
}

/*
  Horizontal product section.

  6 products are visible at one time.
  Arrow moves the section.
*/
function SearchProductSection({ title, products, onAdd, onProductClick }) {
  const [startIndex, setStartIndex] = useState(0);

  const visibleProducts = [];

  for (let i = 0; i < 6; i++) {
    if (products.length === 0) break;

    visibleProducts.push(products[(startIndex + i) % products.length]);
  }

  const moveNext = () => {
    setStartIndex((current) => (current + 4) % products.length);
  };

  const movePrevious = () => {
    setStartIndex(
      (current) => (current - 4 + products.length) % products.length,
    );
  };

  return (
    <section className="search-section">
      <div className="search-section-header">
        <h2>{title}</h2>

        <button className="search-view-all" onClick={() => {}}>
          View all
        </button>
      </div>

      <div className="search-carousel">
        <button
          className="search-arrow search-arrow-left"
          onClick={movePrevious}
        >
          ‹
        </button>

        <div className="search-carousel-products">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={`${product.productId}-${index}`}
              product={product}
              onAdd={() => onAdd(product)}
              onProductClick={() => onProductClick(product)}
            />
          ))}
        </div>

        <button className="search-arrow search-arrow-right" onClick={moveNext}>
          ›
        </button>
      </div>
    </section>
  );
}

export default SearchPage;
