import ProductCard from "../components/ProductCard";
import "../styles/product-section.css";

function ProductSection({ products }) {
  return (
    <section className="product-section">
      <div className="product-section-header">
        <h2>Fruits & Vegetables</h2>
        <button>see all</button>
      </div>

      <div className="product-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default ProductSection;
