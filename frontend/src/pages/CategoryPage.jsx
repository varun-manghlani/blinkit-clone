import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import QuickAddModal from "../components/QuickAddModal";

import "../styles/category-page.css";

const API_URL = "http://localhost:5000";

function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/categories/${category}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch category");
        }

        setCategoryData(data.category);
      } catch (error) {
        console.error("Category fetch error:", error);

        setError(error.message || "Unable to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [category]);

  if (loading) {
    return (
      <main className="category-page">
        <h1>Loading products...</h1>
      </main>
    );
  }

  if (error || !categoryData) {
    return (
      <main className="category-page">
        <h1>{error || "Category not found"}</h1>

        <button onClick={() => navigate("/")}>Go Home</button>
      </main>
    );
  }

  const categoryProducts = categoryData.products || [];

  return (
    <main className="category-page">
      <div className="category-breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>

        {" / "}

        <strong>{categoryData.name}</strong>
      </div>

      <h1>{categoryData.name}</h1>

      <div className="category-products">
        {categoryProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={{
              ...product,
              id: product.productId,
            }}
            onAdd={() => setSelectedProduct(product)}
            onProductClick={() => navigate(`/product/${product.productId}`)}
          />
        ))}
      </div>

      {categoryProducts.length === 0 && (
        <p>No products found in this category.</p>
      )}

      <QuickAddModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}

export default CategoryPage;
