import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import HeroBanner from "../components/HeroBanner";
import PromoCards from "../components/PromoCards";
import Categories from "../components/Categories";
import ProductCarousel from "../components/ProductCarousel";

import "../styles/home.css";

const API_URL = "http://65.0.32.187:5000";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Failed to load products");
        }

        setProducts(
          data.map((product) => ({
            ...product,
            id: product.productId,
          })),
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getFive = (slug) =>
    products.filter((product) => product.categorySlug === slug).slice(0, 5);

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

  return (
    <main className="home">
      <HeroBanner />

      {/* ONLY promo cards */}
      <PromoCards />

      <Categories />

      {!loading && (
        <>
          <ProductCarousel
            title="Fresh Produce, Dairy & Pharmacy"
            products={row1}
            viewAllPath="/collection/fresh-produce-dairy"
          />

          <ProductCarousel
            title="Snacks, Beverages & Pet Supplies"
            products={row2}
            viewAllPath="/collection/snacks-beverages"
          />

          <ProductCarousel
            title="Bakery, Household & Baby Care"
            products={row3}
            viewAllPath="/collection/bakery-household"
          />

          <Footer />
        </>
      )}
    </main>
  );
}

export default Home;
