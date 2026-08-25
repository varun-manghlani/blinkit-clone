import "../styles/quick-add-modal.css";

function QuickAddModal({ product, onClose }) {
  if (!product) {
    return null;
  }

  const units = [
    {
      quantity: "1 kg",
      price: product.price,
      mrp: product.mrp,
      discount: product.discount,
    },
    {
      quantity: "2 × 1 kg",
      price: product.price * 2 - 1,
      mrp: product.mrp * 2,
      discount: 14,
    },
  ];

  const handleAdd = (unit) => {
    console.log("Added:", {
      product: product.name,
      quantity: unit.quantity,
      price: unit.price,
    });
  };

  return (
    <div className="quick-add-overlay" onClick={onClose}>
      <div
        className="quick-add-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="quick-add-close" onClick={onClose}>
          ×
        </button>

        <h2>{product.name}</h2>

        <div className="unit-list">
          {units.map((unit) => (
            <div className="unit-row" key={unit.quantity}>
              <div className="unit-image">
                <img src={product.image} alt={product.name} />
              </div>

              <div className="unit-info">
                <span className="discount">{unit.discount}% OFF</span>

                <p>{unit.quantity}</p>
              </div>

              <div className="unit-price">
                <strong>₹{unit.price}</strong>
                <del>₹{unit.mrp}</del>
              </div>

              <button
                className="unit-add-button"
                onClick={() => handleAdd(unit)}
              >
                ADD
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default QuickAddModal;
