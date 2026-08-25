import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/promo-cards.css";

const API_URL = "http://65.0.32.187:5000";

function PromoCards() {
  const navigate = useNavigate();

  const [promoCards, setPromoCards] = useState([]);

  useEffect(() => {
    const fetchPromoCards = async () => {
      try {
        const response = await fetch(`${API_URL}/api/promo-cards`);

        const data = await response.json();

        console.log("PROMO CARDS API:", data);

        if (!response.ok) {
          throw new Error(data.message || "Failed to load promo cards");
        }

        setPromoCards(data.promoCards || []);
      } catch (error) {
        console.error("Promo cards error:", error);

        setPromoCards([]);
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

  const handleClick = (promoCard) => {
    console.log("PROMO CLICK:", promoCard.redirectUrl);

    navigate(promoCard.redirectUrl);
  };

  return (
    <section className="promo-cards">
      {promoCards.map((promoCard) => (
        <div
          key={promoCard._id}
          className="promo-card"
          onClick={() => handleClick(promoCard)}
          role="button"
          tabIndex={0}
        >
          <img src={getImageUrl(promoCard.imageUrl)} alt="Promo card" />
        </div>
      ))}
    </section>
  );
}

export default PromoCards;
