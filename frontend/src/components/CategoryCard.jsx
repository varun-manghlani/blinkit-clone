import "../styles/category-card.css";

function CategoryCard({ name, image, onClick }) {
  return (
    <div
      className="category-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick?.();
        }
      }}
    >
      <div className="category-image-wrapper">
        <img src={image} alt={name} className="category-image" />
      </div>
    </div>
  );
}

export default CategoryCard;
