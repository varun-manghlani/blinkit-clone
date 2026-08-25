import { useNavigate } from "react-router-dom";
import HeroBannerImage from "../assets/images/HeroBanner.jpg";

import "../styles/hero-banner.css";

function HeroBanner() {
  const navigate = useNavigate();

  return (
    <section
      className="hero-banner"
      onClick={() => navigate("/collection/fresh-produce-dairy")}
    >
      <img src={HeroBannerImage} alt="Fresh groceries" />
    </section>
  );
}

export default HeroBanner;
