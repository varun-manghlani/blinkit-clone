import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/promo-cards.css";

const API_URL = "http://65.0.32.187:5000";

function PromoCards() {
  const navigate = useNavigate();

  const [cards, setCards] = useState([]);

  useEffect(() => {
    const fetchPromoCards = async () => {
      try {
        const response = await fetch(`${API_URL}/api/promo-cards`);

        const data = await response.json();

        console.log("PROMO CARDS FROM DATABASE:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch promo cards");
        }

        setCards(data.promoCards || []);
      } catch (error) {
        console.error("Promo cards error:", error);
      }
    };

    fetchPromoCards();
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

  const handleCardClick = (redirectUrl) => {
    console.log("PROMO CARD CLICKED:", redirectUrl);

    navigate(redirectUrl);
  };

  return (
    <section className="promo-cards">
      {cards.map((card) => (
        <div
          key={card._id}
          className="promo-card"
          onClick={() => handleCardClick(card.redirectUrl)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              handleCardClick(card.redirectUrl);
            }
          }}
        >
          <img src={getImageUrl(card.imageUrl)} alt="Promo card" />
        </div>
      ))}
    </section>
  );
}

export default PromoCards;
