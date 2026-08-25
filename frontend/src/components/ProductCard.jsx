import "../styles/product-card.css";

const API_URL = "http://65.0.32.187:5000";

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  return `${API_URL}${image}`;
}

function ProductCard({ product, onAdd, onProductClick }) {
  return (
    <div className="product-card" onClick={onProductClick}>
      <div className="product-image">
        <img src={getImageUrl(product.image)} alt={product.name} />
      </div>

      <p className="delivery-time">⚡ 8 mins</p>

      <h3>{product.name}</h3>

      <p className="product-quantity">{product.quantity}</p>

      <div className="product-bottom">
        <strong>₹{product.price}</strong>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            if (onAdd) {
              onAdd();
            }
          }}
        >
          ADD
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
