import "../styles/Footer.css";

function Footer() {
  return (
    <footer className="blinkit-footer">
      {/* =====================================
          MAIN FOOTER
      ===================================== */}

      <div className="footer-main">
        {/* Useful Links */}

        <div className="footer-section useful-section">
          <h2>Useful Links</h2>

          <div className="footer-link-columns">
            <div>
              <span>Blog</span>
              <span>Privacy</span>
              <span>Terms</span>
              <span>FAQs</span>
              <span>Security</span>
              <span>Contact</span>
            </div>

            <div>
              <span>Partner</span>
              <span>Franchise</span>
              <span>Seller</span>
              <span>Warehouse</span>
              <span>Deliver</span>
              <span>Resources</span>
            </div>

            <div>
              <span>Recipes</span>
              <span>Bistro</span>
              <span>District</span>
              <span>Blinkit Ambulance</span>
              <span>Feeding India</span>
            </div>
          </div>
        </div>

        {/* Categories */}

        <div className="footer-section categories-section">
          <div className="categories-heading">
            <h2>Categories</h2>

            <span className="see-all">see all</span>
          </div>

          <div className="category-columns">
            {/* Column 1 */}

            <div>
              <span>Bath &amp; Body</span>
              <span>Beauty &amp; Cosmetics</span>
              <span>Health &amp; Pharma</span>
              <span>Atta, Rice &amp; Dal</span>
              <span>Bakery &amp; Biscuits</span>
              <span>Kitchenware &amp; Appliances</span>
              <span>Drinks &amp; Juices</span>
              <span>Sauces &amp; Spreads</span>
              <span>Home &amp; Lifestyle</span>
              <span>Stationery &amp; Games</span>
              <span>Rakhi Gifts</span>
            </div>

            {/* Column 2 */}

            <div>
              <span>Hair</span>
              <span>Feminine Hygiene</span>
              <span>Sexual Wellness</span>
              <span>Oil, Ghee &amp; Masala</span>
              <span>Dry Fruits &amp; Cereals</span>
              <span>Chips &amp; Namkeen</span>
              <span>Tea, Coffee &amp; Milk Drinks</span>
              <span>Paan Corner</span>
              <span>Cleaners &amp; Repellents</span>
              <span>Print Store</span>
            </div>

            {/* Column 3 */}

            <div>
              <span>Skin &amp; Face</span>
              <span>Baby Care</span>
              <span>Vegetables &amp; Fruits</span>
              <span>Dairy, Bread &amp; Eggs</span>
              <span>Chicken, Meat &amp; Fish</span>
              <span>Sweets &amp; Chocolates</span>
              <span>Instant Food</span>
              <span>Ice Creams &amp; More</span>
              <span>Electronics</span>
              <span>E-Gift Cards</span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          BOTTOM BAR
      ===================================== */}

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          {/* Copyright */}

          <div className="footer-copyright">
            © Blink Commerce Private Limited, 2016-2026
          </div>

          {/* Download App */}

          <div className="footer-download">
            <strong>Download App</strong>

            <div className="store-buttons">
              <div className="store-button">
                <span className="store-icon"></span>

                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </div>

              <div className="store-button">
                <span className="store-icon">▶</span>

                <div>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Social Icons */}

          <div className="footer-social">
            <span>f</span>
            <span>𝕏</span>
            <span>◎</span>
            <span>in</span>
            <span>◎</span>
          </div>
        </div>
      </div>

      {/* =====================================
          DISCLAIMER
      ===================================== */}

      <div className="footer-disclaimer">
        “Blinkit” is owned &amp; managed by “Blink Commerce Private Limited” and
        is not related, linked or interconnected in whatsoever manner or nature,
        to “GROFFR.COM” which is a real estate services business operated by
        “Redstone Consultancy Services Private Limited”.
      </div>
    </footer>
  );
}

export default Footer;
