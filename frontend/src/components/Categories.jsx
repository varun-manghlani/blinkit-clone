import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryCard from "./CategoryCard";

import "../styles/categories.css";

const API_URL = "http://localhost:5000";

function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch categories");
        }

        console.log("CATEGORIES FROM DATABASE:", data);

        setCategories(data.categories || []);
      } catch (error) {
        console.error("Categories fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  };

  const handleCategoryClick = (category) => {
    console.log("CATEGORY CLICKED:", category);

    /*
      Always use the slug for the React route.
    */

    navigate(`/category/${category.slug}`);
  };

  if (loading) {
    return (
      <section className="categories">
        <h2>Shop by Category</h2>
      </section>
    );
  }

  return (
    <section className="categories">
      <h2>Shop by Category</h2>

      <div className="category-list">
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            name={category.name}
            image={getImageUrl(category.imageUrl)}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;
