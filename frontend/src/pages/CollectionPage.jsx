import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import ProductCard from "../components/ProductCard";

import { useCart } from "../context/CartContext";

import "../styles/collection-page.css";

function CollectionPage() {
  const { collection } = useParams();

  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // COLLECTIONS
  // ==========================================

  const collections = {
    "fresh-produce-dairy": {
      title: "Fresh Produce & Dairy",
      categories: ["fruits-vegetables", "dairy-breakfast"],
    },

    "snacks-beverages": {
      title: "Snacks & Beverages",
      categories: ["snacks", "beverages"],
    },

    "bakery-household": {
      title: "Bakery & Household Essentials",
      categories: ["bakery", "household"],
    },
  };

  const currentCollection = collections[collection];

  // ==========================================
  // GET PRODUCTS FROM MONGODB
  // ==========================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://65.0.32.187:5000/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        setProducts(data);
      } catch (error) {
        console.error("Collection products error:", error);

        setError("Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ==========================================
  // INVALID COLLECTION
  // ==========================================

  if (!currentCollection) {
    return (
      <main className="collection-page">
        <h1>Collection not found</h1>

        <button onClick={() => navigate("/")}>Back to Home</button>
      </main>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="collection-page">
        <h1>Loading products...</h1>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <main className="collection-page">
        <h1>{error}</h1>
      </main>
    );
  }

  // ==========================================
  // FILTER COLLECTION PRODUCTS
  // ==========================================

  const collectionProducts = products.filter((product) =>
    currentCollection.categories.includes(product.categorySlug),
  );

  return (
    <main className="collection-page">
      {/* Breadcrumb */}

      <div className="collection-breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>

        {" / "}

        <strong>{currentCollection.title}</strong>
      </div>

      {/* Header */}

      <div className="collection-header">
        <h1>{currentCollection.title}</h1>

        <p>{collectionProducts.length} products</p>
      </div>

      {/* Products */}

      <div className="collection-products">
        {collectionProducts.map((product) => (
          <ProductCard
            key={product.productId}
            product={product}
            onAdd={() => addToCart(product)}
            onProductClick={() => navigate(`/product/${product.productId}`)}
          />
        ))}
      </div>
    </main>
  );
}

export default CollectionPage;
