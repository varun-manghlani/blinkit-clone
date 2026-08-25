import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/admin-promo-cards.css";

const API_URL = "http://65.0.32.187:5000";

function AdminPromoCards() {
  const navigate = useNavigate();

  const [promoCards, setPromoCards] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [redirectUrl, setRedirectUrl] = useState("");

  const [selectedProducts, setSelectedProducts] = useState([]);

  const [productSearch, setProductSearch] = useState("");

  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH PROMO CARDS
  // ==========================================

  const fetchPromoCards = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/admin/promo-cards`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch promo cards");
      }

      setPromoCards(data.promoCards || []);
    } catch (error) {
      console.error("Fetch promo cards error:", error);

      setError(error.message || "Failed to fetch promo cards");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PRODUCTS
  // ==========================================

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      /*
        We fetch the existing products from your
        product API and perform the search on the
        frontend.

        This avoids making a request for every
        character typed in the search box.
      */

      const response = await fetch(`${API_URL}/api/products`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      /*
        Supports common API response formats:
        { products: [] }
        or
        []
      */

      const productList = Array.isArray(data) ? data : data.products || [];

      setProducts(productList);
    } catch (error) {
      console.error("Fetch products error:", error);

      setError(error.message || "Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchPromoCards();
    fetchProducts();
  }, []);

  // ==========================================
  // IMAGE URL
  // ==========================================

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    return `${API_URL}${imageUrl}`;
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setEditingId(null);

    setImage(null);
    setImagePreview("");

    setRedirectUrl("");

    setSelectedProducts([]);

    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(false);
  };

  // ==========================================
  // OPEN CREATE FORM
  // ==========================================

  const handleCreate = () => {
    setEditingId(null);

    setImage(null);
    setImagePreview("");

    setRedirectUrl("");

    setSelectedProducts([]);

    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(true);
  };

  // ==========================================
  // OPEN EDIT FORM
  // ==========================================

  const handleEdit = (promoCard) => {
    setEditingId(promoCard._id);

    setImage(null);

    setImagePreview(getImageUrl(promoCard.imageUrl));

    setRedirectUrl(promoCard.redirectUrl || "");

    setSelectedProducts(promoCard.products || []);

    setProductSearch("");

    setError("");
    setSuccess("");

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // IMAGE CHANGE
  // ==========================================

  const handleImageChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setImage(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);

    setImagePreview(previewUrl);
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const handleAddProduct = (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      return;
    }

    const alreadyAdded = selectedProducts.some(
      (item) => String(item._id || item.id) === String(productId),
    );

    if (alreadyAdded) {
      return;
    }

    setSelectedProducts([...selectedProducts, product]);
  };

  // ==========================================
  // REMOVE PRODUCT
  // ==========================================

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(
      selectedProducts.filter(
        (product) => String(product._id || product.id) !== String(productId),
      ),
    );
  };

  // ==========================================
  // SEARCH PRODUCTS
  // ==========================================

  const filteredProducts = products.filter((product) => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return false;
    }

    const name = product.name || product.title || "";

    return name.toLowerCase().includes(search);
  });

  // ==========================================
  // SAVE PROMO CARD
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!editingId && !image) {
      setError("Please select a promo card image");

      return;
    }

    if (!redirectUrl.trim()) {
      setError("Redirect URL is required");

      return;
    }

    try {
      setFormLoading(true);

      const formData = new FormData();

      if (image) {
        formData.append("image", image);
      }

      formData.append("redirectUrl", redirectUrl.trim());

      const productIds = selectedProducts.map(
        (product) => product._id || product.id,
      );

      formData.append("products", JSON.stringify(productIds));

      const url = editingId
        ? `${API_URL}/api/admin/promo-cards/${editingId}`
        : `${API_URL}/api/admin/promo-cards`;

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save promo card");
      }

      setSuccess(
        editingId
          ? "Promo card updated successfully"
          : "Promo card created successfully",
      );

      await fetchPromoCards();

      setTimeout(() => {
        resetForm();
      }, 800);
    } catch (error) {
      console.error("Save promo card error:", error);

      setError(error.message || "Failed to save promo card");
    } finally {
      setFormLoading(false);
    }
  };

  // ==========================================
  // DELETE PROMO CARD
  // ==========================================

  const handleDelete = async (promoCard) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this promo card?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `${API_URL}/api/admin/promo-cards/${promoCard._id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete promo card");
      }

      setSuccess("Promo card deleted successfully");

      await fetchPromoCards();
    } catch (error) {
      console.error("Delete promo card error:", error);

      setError(error.message || "Failed to delete promo card");
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="admin-promo-page">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="admin-promo-header">
        <div>
          <button
            className="admin-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <h1>Promo Cards</h1>

          <p>Manage promotional cards and their products.</p>
        </div>

        <button className="admin-add-promo-button" onClick={handleCreate}>
          + Add Promo Card
        </button>
      </div>

      {/* ======================================
          SUCCESS / ERROR
      ====================================== */}

      {error && <div className="admin-promo-error">{error}</div>}

      {success && <div className="admin-promo-success">{success}</div>}

      {/* ======================================
          CREATE / EDIT FORM
      ====================================== */}

      {showForm && (
        <section className="promo-form-card">
          <div className="promo-form-header">
            <div>
              <h2>{editingId ? "Edit Promo Card" : "Create Promo Card"}</h2>

              <p>
                Add an image, redirect URL and as many products as you need.
              </p>
            </div>

            <button
              className="promo-close-button"
              onClick={resetForm}
              type="button"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* IMAGE */}

            <div className="promo-form-section">
              <label>Promo Card Image</label>

              <div className="promo-image-upload">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Promo preview"
                    className="promo-image-preview"
                  />
                ) : (
                  <div className="promo-image-placeholder">
                    No image selected
                  </div>
                )}

                <label className="promo-file-button">
                  {image ? "Change Image" : "Choose Image"}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.avif,image/*"
                    onChange={handleImageChange}
                    hidden
                  />
                </label>
              </div>

              {editingId && (
                <small>
                  Leave the image unchanged if you don't want to replace it.
                </small>
              )}
            </div>

            {/* REDIRECT URL */}

            <div className="promo-form-section">
              <label htmlFor="redirect-url">Redirect URL</label>

              <input
                id="redirect-url"
                type="text"
                value={redirectUrl}
                onChange={(event) => setRedirectUrl(event.target.value)}
                placeholder="/collection/snacks-beverages"
              />
            </div>

            {/* PRODUCTS */}

            <div className="promo-products-section">
              <div className="promo-products-heading">
                <div>
                  <h3>Products</h3>

                  <p>
                    {selectedProducts.length} product
                    {selectedProducts.length !== 1 ? "s" : ""} selected
                  </p>
                </div>
              </div>

              {/* SELECTED PRODUCTS */}

              {selectedProducts.length > 0 && (
                <div className="selected-products">
                  {selectedProducts.map((product) => {
                    const productId = product._id || product.id;

                    const productName =
                      product.name || product.title || "Unnamed Product";

                    return (
                      <div className="selected-product" key={String(productId)}>
                        <div className="selected-product-info">
                          {product.image && (
                            <img
                              src={getImageUrl(product.image)}
                              alt={productName}
                            />
                          )}

                          {product.imageUrl && (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={productName}
                            />
                          )}

                          <div>
                            <strong>{productName}</strong>

                            {product.price !== undefined && (
                              <span>₹{product.price}</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          className="remove-product-button"
                          onClick={() => handleRemoveProduct(productId)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PRODUCT SEARCH */}

              <div className="product-search-wrapper">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products to add..."
                />
              </div>

              {/* SEARCH RESULTS */}

              {productSearch.trim() && (
                <div className="product-search-results">
                  {productsLoading ? (
                    <div className="product-search-message">
                      Loading products...
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="product-search-message">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map((product) => {
                      const productId = product._id || product.id;

                      const alreadySelected = selectedProducts.some(
                        (item) =>
                          String(item._id || item.id) === String(productId),
                      );

                      const productName =
                        product.name || product.title || "Unnamed Product";

                      return (
                        <div className="product-result" key={String(productId)}>
                          <div className="product-result-info">
                            {(product.image || product.imageUrl) && (
                              <img
                                src={getImageUrl(
                                  product.image || product.imageUrl,
                                )}
                                alt={productName}
                              />
                            )}

                            <div>
                              <strong>{productName}</strong>

                              {product.price !== undefined && (
                                <span>₹{product.price}</span>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={alreadySelected}
                            className={
                              alreadySelected
                                ? "product-added-button"
                                : "product-add-button"
                            }
                            onClick={() => handleAddProduct(product)}
                          >
                            {alreadySelected ? "Added" : "+ Add"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* FORM ACTIONS */}

            <div className="promo-form-actions">
              <button
                type="button"
                className="promo-cancel-button"
                onClick={resetForm}
                disabled={formLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="promo-save-button"
                disabled={formLoading}
              >
                {formLoading
                  ? "Saving..."
                  : editingId
                    ? "Update Promo Card"
                    : "Create Promo Card"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ======================================
          PROMO CARDS
      ====================================== */}

      <section className="promo-cards-section">
        <div className="promo-cards-title">
          <div>
            <h2>All Promo Cards</h2>

            <p>
              {promoCards.length} promo card
              {promoCards.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="promo-loading">Loading promo cards...</div>
        ) : promoCards.length === 0 ? (
          <div className="promo-empty">
            <div className="promo-empty-icon">🖼️</div>

            <h3>No Promo Cards Yet</h3>

            <p>Create your first promotional card.</p>

            <button onClick={handleCreate} className="admin-add-promo-button">
              + Add Promo Card
            </button>
          </div>
        ) : (
          <div className="promo-card-grid">
            {promoCards.map((promoCard) => (
              <article className="admin-promo-card" key={promoCard._id}>
                {/* IMAGE */}

                <div className="admin-promo-image-wrapper">
                  <img
                    src={getImageUrl(promoCard.imageUrl)}
                    alt="Promo card"
                    className="admin-promo-image"
                  />

                  <span
                    className={
                      promoCard.isActive
                        ? "promo-active-badge"
                        : "promo-inactive-badge"
                    }
                  >
                    {promoCard.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* DETAILS */}

                <div className="admin-promo-details">
                  <div className="promo-detail-row">
                    <span>Redirect URL</span>

                    <strong>{promoCard.redirectUrl}</strong>
                  </div>

                  <div className="promo-detail-row">
                    <span>Products</span>

                    <strong>{promoCard.products?.length || 0}</strong>
                  </div>
                </div>

                {/* PRODUCTS PREVIEW */}

                {promoCard.products?.length > 0 && (
                  <div className="promo-product-preview">
                    {promoCard.products.slice(0, 5).map((product) => {
                      const productId = product._id || product.id;

                      return (
                        <span
                          key={String(productId)}
                          className="promo-product-chip"
                        >
                          {product.name || product.title || "Product"}
                        </span>
                      );
                    })}

                    {promoCard.products.length > 5 && (
                      <span className="promo-more-chip">
                        +{promoCard.products.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* ACTIONS */}

                <div className="admin-promo-actions">
                  <button
                    className="promo-edit-button"
                    onClick={() => handleEdit(promoCard)}
                  >
                    Edit
                  </button>

                  <button
                    className="promo-delete-button"
                    onClick={() => handleDelete(promoCard)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminPromoCards;
